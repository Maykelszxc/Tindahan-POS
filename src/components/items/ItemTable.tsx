import 'tabulator-tables/dist/css/tabulator.min.css'
import { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Pencil, Trash2 } from 'lucide-react'
import { ReactTabulator, type ColumnDefinition } from 'react-tabulator'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import type { Item } from '../../types/item.types'
import { calculateProfit, calculateProfitMargin, formatCurrency } from '../../utils/calculations'

const cardPageSize = 10

type ItemTableProps = {
  items: Item[]
  onEdit: (item: Item) => void
  onDelete: (item: Item) => void
}

function getItemTableData(items: Item[]) {
  return items.map((item) => ({
    id: item.id,
    item_name: item.name,
    category_name: item.category_name ?? '',
    buying_price: item.buying_price,
    selling_price: item.selling_price,
    profit: calculateProfit(item.buying_price, item.selling_price),
    profit_margin: calculateProfitMargin(item.buying_price, item.selling_price),
    stock: item.stock,
    actions: '',
    _raw: item,
  }))
}

function mountIcon(element: HTMLElement, Icon: typeof Pencil, label: string) {
  element.setAttribute('aria-label', label)
  element.title = label
  createRoot(element).render(<Icon size={16} strokeWidth={2} aria-hidden="true" />)
}

function ItemCardList({ items, onEdit, onDelete }: ItemTableProps) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(items.length / cardPageSize))

  useEffect(() => {
    setPage(1)
  }, [items.length])

  const pageItems = useMemo(
    () => items.slice((page - 1) * cardPageSize, page * cardPageSize),
    [items, page],
  )

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
        No items found.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {pageItems.map((item) => {
          const profit = calculateProfit(item.buying_price, item.selling_price)
          const isLowStock = item.stock <= 5

          return (
            <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.category_name || '—'}</p>
                </div>
                <span
                  className={
                    isLowStock
                      ? 'inline-flex shrink-0 min-w-9 justify-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600'
                      : 'inline-flex shrink-0 min-w-9 justify-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700'
                  }
                >
                  {item.stock}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-slate-400">Buying</p>
                  <p className="mt-0.5 font-semibold text-slate-800">{formatCurrency(item.buying_price)}</p>
                </div>
                <div>
                  <p className="text-slate-400">Selling</p>
                  <p className="mt-0.5 font-semibold text-slate-800">{formatCurrency(item.selling_price)}</p>
                </div>
                <div>
                  <p className="text-slate-400">Profit</p>
                  <p className="mt-0.5 font-semibold text-slate-800">{formatCurrency(profit)}</p>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(item)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100"
                  aria-label={`Edit ${item.name}`}
                  title={`Edit ${item.name}`}
                >
                  <Pencil size={16} strokeWidth={2} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(item)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                  aria-label={`Delete ${item.name}`}
                  title={`Delete ${item.name}`}
                >
                  <Trash2 size={16} strokeWidth={2} aria-hidden="true" />
                </button>
              </div>
            </div>
          )
        })}
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

export function ItemTable({ items, onEdit, onDelete }: ItemTableProps) {
  const isCompactView = useMediaQuery('(max-width: 1024px)')

  const columns = useMemo<ColumnDefinition[]>(
    () => [
      {
        title: 'Item Name',
        field: 'item_name',
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
        title: 'Category',
        field: 'category_name',
        hozAlign: 'left',
        headerSort: true,
        minWidth: 110,
        formatter: (cell: any, formatterParams: any, onRendered: any) => {
          void formatterParams
          void onRendered
          const value = cell.getValue()
          return value ? String(value) : '—'
        },
      },
      {
        title: 'Buying Price',
        field: 'buying_price',
        hozAlign: 'right',
        minWidth: 110,
        formatter: (cell: any, formatterParams: any, onRendered: any) => {
          void formatterParams
          void onRendered
          return formatCurrency(Number(cell.getValue() || 0))
        },
        headerSort: true,
      },
      {
        title: 'Selling Price',
        field: 'selling_price',
        hozAlign: 'right',
        minWidth: 110,
        formatter: (cell: any, formatterParams: any, onRendered: any) => {
          void formatterParams
          void onRendered
          return formatCurrency(Number(cell.getValue() || 0))
        },
        headerSort: true,
      },
      {
        title: 'Profit',
        field: 'profit',
        hozAlign: 'right',
        minWidth: 100,
        formatter: (cell: any, formatterParams: any, onRendered: any) => {
          void formatterParams
          void onRendered
          return formatCurrency(Number(cell.getValue() || 0))
        },
        headerSort: true,
      },
      {
        title: 'Stock',
        field: 'stock',
        hozAlign: 'right',
        minWidth: 90,
        headerSort: true,
        formatter: (cell: any, formatterParams: any, onRendered: any) => {
          void formatterParams
          void onRendered
          const stock = Number(cell.getValue() || 0)
          const badge = document.createElement('span')
          badge.textContent = String(stock)
          badge.className =
            stock <= 5
              ? 'inline-flex min-w-9 justify-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600'
              : 'inline-flex min-w-9 justify-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700'
          return badge
        },
      },
      {
        title: 'Actions',
        field: 'actions',
        hozAlign: 'center',
        minWidth: 100,
        headerSort: false,
        formatter: (cell: any, formatterParams: any, onRendered: any) => {
          void formatterParams
          void onRendered
          const item = cell.getData()._raw as Item
          const block = document.createElement('div')
          block.className = 'flex justify-center gap-2'

          const editButton = document.createElement('button')
          editButton.type = 'button'
          editButton.className =
            'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100'
          mountIcon(editButton, Pencil, `Edit ${item.name}`)
          editButton.addEventListener('click', () => onEdit(item))

          const deleteButton = document.createElement('button')
          deleteButton.type = 'button'
          deleteButton.className =
            'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100'
          mountIcon(deleteButton, Trash2, `Delete ${item.name}`)
          deleteButton.addEventListener('click', () => onDelete(item))

          block.appendChild(editButton)
          block.appendChild(deleteButton)
          return block
        },
      },
    ],
    [onEdit, onDelete],
  )

  if (isCompactView) {
    return <ItemCardList items={items} onEdit={onEdit} onDelete={onDelete} />
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <ReactTabulator
        key={items.length}
        data={getItemTableData(items)}
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
          placeholder: 'No items found.',
        }}
      />
    </div>
  )
}
