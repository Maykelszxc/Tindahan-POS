import { Plus, Search, ShoppingBag } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { SaleCart } from '../components/sales/SaleCart'
import { SaleReviewModal } from '../components/sales/SaleReviewModal'
import { useDebounce } from '../hooks/useDebounce'
import { getItems, updateItem } from '../services/itemService'
import { recordSale } from '../services/salesService'
import type { Item } from '../types/item.types'
import { formatCurrency } from '../utils/calculations'
import type { DailySalesReport, SaleLine } from '../types/sale.types'

type SalesPageProps = {
  onNotify: (message: string, type?: 'success' | 'error') => void
  onSaleCompleted: (items: Item[], report: DailySalesReport) => void
}

export function SalesPage({ onNotify, onSaleCompleted }: SalesPageProps) {
  const [items, setItems] = useState<Item[]>([])
  const [lines, setLines] = useState<SaleLine[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [loading, setLoading] = useState(true)
  const [completingSale, setCompletingSale] = useState(false)
  const [isReviewOpen, setIsReviewOpen] = useState(false)

  useEffect(() => {
    async function loadItems() {
      try {
        setItems(await getItems())
      } catch {
        onNotify('Unable to load items for a new sale.', 'error')
      } finally {
        setLoading(false)
      }
    }

    void loadItems()
  }, [onNotify])

  const availableItems = useMemo(() => {
    const normalizedSearch = debouncedSearchTerm.trim().toLowerCase()

    return items.filter(
      (item) =>
        item.stock > 0 &&
        (normalizedSearch.length === 0 || item.name.toLowerCase().includes(normalizedSearch)),
    )
  }, [items, debouncedSearchTerm])

  const productCards = useMemo(
    () => items.filter((item) => item.stock > 0).sort((first, second) => first.name.localeCompare(second.name)),
    [items],
  )

  const matchedItem = debouncedSearchTerm.trim().length > 0 ? availableItems[0] : undefined

  function addItem(item: Item) {
    setLines((current) => {
      const existing = current.find((line) => line.item.id === item.id)
      if (existing) {
        if (existing.quantity >= item.stock) {
          return current
        }

        return current.map((line) =>
          line.item.id === item.id ? { ...line, quantity: line.quantity + 1 } : line,
        )
      }

      return [...current, { item, quantity: 1 }]
    })
  }

  function changeQuantity(itemId: string, amount: number) {
    setLines((current) =>
      current
        .map((line) =>
          line.item.id === itemId
            ? { ...line, quantity: Math.min(line.item.stock, line.quantity + amount) }
            : line,
        )
        .filter((line) => line.quantity > 0),
    )
  }

  function removeItem(itemId: string) {
    setLines((current) => current.filter((line) => line.item.id !== itemId))
  }

  function openSaleReview() {
    if (lines.length > 0 && !completingSale) {
      setIsReviewOpen(true)
    }
  }

  async function proceedWithSale() {
    if (lines.length === 0 || completingSale) {
      return
    }

    try {
      setCompletingSale(true)
      const updatedItems = await Promise.all(
        lines.map((line) =>
          updateItem(line.item.id, {
            stock: Math.max(0, line.item.stock - line.quantity),
          }),
        ),
      )

      setItems((current) =>
        current.map((item) => updatedItems.find((updatedItem) => updatedItem.id === item.id) ?? item),
      )
      const total = lines.reduce((sum, line) => sum + line.item.selling_price * line.quantity, 0)
      const report = await recordSale({
        id: crypto.randomUUID(),
        completedAt: new Date().toISOString(),
        total,
        lines: lines.map((line) => ({
          itemId: line.item.id,
          itemName: line.item.name,
          quantity: line.quantity,
          unitPrice: line.item.selling_price,
          lineTotal: line.item.selling_price * line.quantity,
        })),
      })
      onSaleCompleted(updatedItems, report)
      setLines([])
      setIsReviewOpen(false)
      onNotify('Sale completed and stock updated.')
    } catch (error) {
      onNotify(error instanceof Error ? error.message : 'Unable to complete sale. Please try again.', 'error')
    } finally {
      setCompletingSale(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">New Sale</h1>
        <p className="mt-2 text-sm text-slate-600">Select products, adjust quantities, and collect the total.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-900">Products</h2>
              <p className="mt-1 text-xs text-slate-500">Tap a product to add it to the sale.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              {items.filter((item) => item.stock > 0).length} available
            </span>
          </div>

          <div className="relative mb-5">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search products..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-28 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
            <button
              type="button"
              onClick={() => {
                if (matchedItem) {
                  addItem(matchedItem)
                  setSearchTerm('')
                }
              }}
              disabled={!matchedItem}
              className="absolute right-1.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <Plus size={14} aria-hidden="true" />
              Add
            </button>
          </div>

          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quick add</p>
              <p className="text-xs text-slate-400">A–Z</p>
            </div>
            <div className="quick-add-slider pb-2">
              {productCards.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => addItem(item)}
                  disabled={lines.find((line) => line.item.id === item.id)?.quantity === item.stock}
                  className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="block truncate text-sm font-semibold text-slate-800">{item.name}</span>
                  <span className="mt-1 block truncate text-xs text-slate-500">
                    {formatCurrency(item.selling_price)} · {item.stock} left
                  </span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-10 text-center text-sm text-slate-500 sm:py-16">Loading products...</div>
          ) : debouncedSearchTerm.trim().length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-4 text-center sm:py-16">
              <Search size={30} className="mx-auto hidden text-slate-300 sm:block" aria-hidden="true" />
              <p className="text-sm font-medium text-slate-600 sm:mt-3">Search for a product to add</p>
              <p className="mt-1 hidden text-xs text-slate-400 sm:block">Enter a product name, then use the Add button.</p>
            </div>
          ) : !matchedItem ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center sm:py-16">
              <ShoppingBag size={30} className="mx-auto text-slate-300" aria-hidden="true" />
              <p className="mt-3 text-sm font-medium text-slate-600">No products found</p>
              <p className="mt-1 text-xs text-slate-400">Try another search term or add stock first.</p>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">{matchedItem.name}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {formatCurrency(matchedItem.selling_price)} · {matchedItem.stock} in stock
                </p>
              </div>
              <span className="shrink-0 text-xs font-medium text-emerald-700">Ready to add</span>
            </div>
          )}
        </section>

        <SaleCart
          lines={lines}
          onIncrease={(itemId) => changeQuantity(itemId, 1)}
          onDecrease={(itemId) => changeQuantity(itemId, -1)}
          onRemove={removeItem}
          onComplete={openSaleReview}
          completingSale={completingSale}
        />
      </div>

      <SaleReviewModal
        open={isReviewOpen}
        lines={lines}
        total={lines.reduce((sum, line) => sum + line.item.selling_price * line.quantity, 0)}
        submitting={completingSale}
        onClose={() => setIsReviewOpen(false)}
        onProceed={() => void proceedWithSale()}
      />
    </div>
  )
}
