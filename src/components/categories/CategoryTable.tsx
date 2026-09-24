import 'tabulator-tables/dist/css/tabulator.min.css'
import { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Pencil, Trash2 } from 'lucide-react'
import { ReactTabulator, type ColumnDefinition } from 'react-tabulator'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import type { Category } from '../../types/category.types'

const cardPageSize = 10

type CategoryTableProps = {
  categories: Category[]
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

function getCategoryTableData(categories: Category[]) {
  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    actions: '',
    _raw: category,
  }))
}

function mountIcon(element: HTMLElement, Icon: typeof Pencil, label: string) {
  element.setAttribute('aria-label', label)
  element.title = label
  createRoot(element).render(<Icon size={16} strokeWidth={2} aria-hidden="true" />)
}

function CategoryCardList({ categories, onEdit, onDelete }: CategoryTableProps) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(categories.length / cardPageSize))

  useEffect(() => {
    setPage(1)
  }, [categories.length])

  const pageCategories = useMemo(
    () => categories.slice((page - 1) * cardPageSize, page * cardPageSize),
    [categories, page],
  )

  if (categories.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
        No categories found.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {pageCategories.map((category) => (
          <div key={category.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="truncate text-sm font-semibold text-slate-900">{category.name}</p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => onEdit(category)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100"
                aria-label={`Edit ${category.name}`}
                title={`Edit ${category.name}`}
              >
                <Pencil size={16} strokeWidth={2} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(category)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                aria-label={`Delete ${category.name}`}
                title={`Delete ${category.name}`}
              >
                <Trash2 size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Prev
          </button>
          <span className="px-2 text-xs font-medium text-slate-500">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function CategoryTable({ categories, onEdit, onDelete }: CategoryTableProps) {
  const isCompactView = useMediaQuery('(max-width: 1024px)')

  const columns = useMemo<ColumnDefinition[]>(
    () => [
      {
        title: 'Category Name',
        field: 'name',
        hozAlign: 'left',
        headerSort: true,
        widthGrow: 2,
        minWidth: 140,
        formatter: (cell: any, formatterParams: any, onRendered: any) => {
          void formatterParams
          void onRendered
          return String(cell.getValue() ?? '')
        },
      },
      {
        title: 'Actions',
        field: 'actions',
        hozAlign: 'center',
        minWidth: 130,
        headerSort: false,
        formatter: (cell: any, formatterParams: any, onRendered: any) => {
          void formatterParams
          void onRendered
          const category = cell.getData()._raw as Category

          const wrapper = document.createElement('div')
          wrapper.className = 'flex justify-center gap-2'

          const editButton = document.createElement('button')
          editButton.type = 'button'
          editButton.className =
            'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100'
          mountIcon(editButton, Pencil, `Edit ${category.name}`)
          editButton.addEventListener('click', () => onEdit(category))

          const deleteButton = document.createElement('button')
          deleteButton.type = 'button'
          deleteButton.className =
            'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100'
          mountIcon(deleteButton, Trash2, `Delete ${category.name}`)
          deleteButton.addEventListener('click', () => onDelete(category))

          wrapper.appendChild(editButton)
          wrapper.appendChild(deleteButton)
          return wrapper
        },
      },
    ],
    [onEdit, onDelete],
  )

  if (isCompactView) {
    return <CategoryCardList categories={categories} onEdit={onEdit} onDelete={onDelete} />
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-200">
      <ReactTabulator
        key={categories.length}
        data={getCategoryTableData(categories)}
        columns={columns}
        layout={'fitColumns'}
        movableColumns={false}
        resizableColumns={false}
        selectable={1}
        tooltips={false}
        height={'auto'}
        options={{
          pagination: true,
          paginationSize: 10,
          paginationSizeSelector: [10, 25, 50],
          paginationCounter: 'rows',
          columnDefaults: {
            resizable: false,
            headerSort: true,
          },
          placeholder: 'No categories found.',
        }}
      />
    </div>
  )
}
