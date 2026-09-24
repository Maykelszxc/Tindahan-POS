import { SalesReport } from '../components/sales/SalesReport'
import type { Category } from '../types/category.types'
import type { Item } from '../types/item.types'
import type { DailySalesReport } from '../types/sale.types'
import { calculateProfit, formatCurrency } from '../utils/calculations'

type DashboardPageProps = {
  items: Item[]
  categories: Category[]
  dailySales: DailySalesReport
}

export function DashboardPage({ items, categories, dailySales }: DashboardPageProps) {
  const totalInventoryValue = items.reduce(
    (sum, item) => sum + item.stock * item.buying_price,
    0,
  )

  const totalProfit = items.reduce(
    (sum, item) => sum + calculateProfit(item.buying_price, item.selling_price) * item.stock,
    0,
  )

  const lowStockItems = items.filter((item) => item.stock <= 5).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">Quick overview of your store.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Items</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{items.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Categories</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{categories.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Inventory Value</p>
          <p className="mt-3 truncate text-2xl font-bold text-slate-900 xl:text-3xl" title={formatCurrency(totalInventoryValue)}>
            {formatCurrency(totalInventoryValue)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Potential Profit</p>
          <p className="mt-3 truncate text-2xl font-bold text-slate-900 xl:text-3xl" title={formatCurrency(totalProfit)}>
            {formatCurrency(totalProfit)}
          </p>
        </div>
      </div>

      <SalesReport dailySales={dailySales} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Store status</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <span>Low stock alerts</span>
              <span className="font-semibold text-amber-600">{lowStockItems}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <span>Active categories</span>
              <span className="font-semibold text-slate-800">{categories.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <span>Average selling price</span>
              <span className="font-semibold text-slate-800">
                {items.length
                  ? formatCurrency(
                      items.reduce((sum, item) => sum + item.selling_price, 0) / items.length,
                    )
                  : formatCurrency(0)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Top items</h2>
          <div className="mt-4 space-y-3">
            {items.length === 0 ? (
              <p className="text-sm text-slate-500">No items yet.</p>
            ) : (
              items
                .slice(0, 5)
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl bg-slate-50 p-3"
                  >
                    <div>
                      <p className="font-medium text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-500">Stock: {item.stock}</p>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600">
                      {formatCurrency(item.selling_price)}
                    </span>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
