import { useEffect, useMemo, useState } from 'react'
import { ItemForm } from '../components/items/ItemForm'
import { ItemModal } from '../components/items/ItemModal'
import { ItemTable } from '../components/items/ItemTable'
import { getCategories } from '../services/categoryService'
import { createItem, deleteItem, getItems, updateItem } from '../services/itemService'
import type { Category } from '../types/category.types'
import type { Item } from '../types/item.types'
import { useDebounce } from '../hooks/useDebounce'

type ItemsPageProps = {
  onNotify: (message: string, type?: 'success' | 'error') => void
}

export function ItemsPage({ onNotify }: ItemsPageProps) {
  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)

  const debouncedSearch = useDebounce(searchTerm, 300)

  async function fetchData() {
    try {
      setLoading(true)
      const [itemsResponse, categoriesResponse] = await Promise.all([getItems(), getCategories()])
      setItems(itemsResponse)
      setCategories(categoriesResponse)
    } catch {
      onNotify('Unable to load items. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchData()
  }, [])

  const filteredItems = useMemo(() => {
    const normalized = debouncedSearch.trim().toLowerCase()

    return items.filter((item) => {
      const matchesSearch =
        normalized.length === 0 ||
        item.name.toLowerCase().includes(normalized) ||
        categories
          .find((category) => category.id === item.category_id)
          ?.name.toLowerCase()
          .includes(normalized) ||
        false

      const matchesCategory =
        categoryFilter === 'all' ||
        item.category_id === categoryFilter

      return matchesSearch && matchesCategory
    })
  }, [items, categories, debouncedSearch, categoryFilter])

  function handleOpenCreate() {
    setEditingItem(null)
    setIsFormOpen(true)
  }

  function handleOpenEdit(item: Item) {
    setEditingItem(item)
    setIsFormOpen(true)
  }

  async function handleSubmit(values: {
    category_id: string
    name: string
    buying_price: number
    selling_price: number
    stock: number
  }) {
    try {
      if (editingItem) {
        const updatedItem = await updateItem(editingItem.id, values)
        setItems((current) =>
          current.map((item) => (item.id === updatedItem.id ? { ...item, ...updatedItem } : item)),
        )
        onNotify('Item updated successfully.')
      } else {
        const createdItem = await createItem(values)
        setItems((current) => [createdItem, ...current])
        onNotify('Item created successfully.')
      }

      setIsFormOpen(false)
      setEditingItem(null)
    } catch (error) {
      onNotify(error instanceof Error ? error.message : 'Unable to save item. Please try again.', 'error')
    }
  }

  async function handleDelete(item: Item) {
    const confirmed = window.confirm(`Are you sure you want to delete "${item.name}"?`)
    if (!confirmed) {
      return
    }

    try {
      await deleteItem(item.id)
      setItems((current) => current.filter((currentItem) => currentItem.id !== item.id))
      onNotify('Item deleted successfully.')
    } catch (error) {
      onNotify(error instanceof Error ? error.message : 'Unable to delete item. Please try again.', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Items</h1>
          <p className="mt-2 text-sm text-slate-600">Manage your store items and inventory.</p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-500"
        >
          + Add Item
        </button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search items..."
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 pr-10 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
          {searchTerm ? (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              ×
            </button>
          ) : null}
        </div>

        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          Loading items...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center shadow-sm">
          <p className="text-lg font-medium text-slate-700">
            {searchTerm || categoryFilter !== 'all' ? 'No items match your filters.' : 'No items found.'}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {searchTerm || categoryFilter !== 'all'
              ? 'Try another search term or category.'
              : 'Add your first item to start managing your inventory.'}
          </p>
          {!searchTerm && categoryFilter === 'all' ? (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
            >
              + Add Item
            </button>
          ) : null}
        </div>
      ) : (
        <ItemTable
          items={filteredItems}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />
      )}

      <ItemModal
        open={isFormOpen}
        title={editingItem ? 'Edit Item' : 'Add Item'}
        onClose={() => {
          setIsFormOpen(false)
          setEditingItem(null)
        }}
      >
        <ItemForm
          categories={categories}
          initialValues={editingItem ?? undefined}
          submitLabel="Save Item"
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsFormOpen(false)
            setEditingItem(null)
          }}
        />
      </ItemModal>
    </div>
  )
}
