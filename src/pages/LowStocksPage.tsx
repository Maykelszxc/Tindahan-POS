import { AlertTriangle, PackageSearch } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { getItems } from '../services/itemService'
import type { Item } from '../types/item.types'

type LowStocksPageProps = {
  onNotify: (message: string, type?: 'success' | 'error') => void
}

const lowStockThreshold = 5

export function LowStocksPage({ onNotify }: LowStocksPageProps) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadItems() {
      try {
        setItems(await getItems())
      } catch {
        onNotify('Unable to load low stock items.', 'error')
      } finally {
        setLoading(false)
      }
    }

    void loadItems()
  }, [onNotify])

  const lowStockItems = useMemo(
    () => items.filter((item) => item.stock <= lowStockThreshold).sort((first, second) => first.name.localeCompare(second.name)),
    [items],
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Low Stocks</h1>
        <p className="mt-2 text-sm text-slate-600">Keep track of products with {lowStockThreshold} or fewer items remaining.</p>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
          <AlertTriangle size={19} aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-medium text-amber-800">Low stock items</p>
          <p className="mt-1 text-2xl font-bold text-amber-950">{lowStockItems.length}</p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">Loading low stock items...</div>
      ) : lowStockItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
          <PackageSearch size={32} className="mx-auto text-slate-300" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium text-slate-700">All products have healthy stock levels.</p>
        </div>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-[minmax(0,1fr)_130px_130px] border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <span>Product</span>
            <span>Category</span>
            <span className="text-right">Stock left</span>
          </div>
          {lowStockItems.map((item) => (
            <div key={item.id} className="grid grid-cols-[minmax(0,1fr)_130px_130px] items-center gap-3 border-b border-slate-100 px-5 py-4 last:border-b-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">{item.name}</p>
                <p className="mt-1 text-xs text-slate-500">{item.stock === 0 ? 'Out of stock' : 'Needs replenishment'}</p>
              </div>
              <span className="truncate text-sm text-slate-600">{item.category_name || 'Uncategorized'}</span>
              <span className={`text-right text-sm font-bold ${item.stock === 0 ? 'text-red-600' : 'text-amber-700'}`}>
                {item.stock}
              </span>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}