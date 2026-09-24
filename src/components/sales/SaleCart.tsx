import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import type { SaleLine } from '../../types/sale.types'
import { formatCurrency } from '../../utils/calculations'

type SaleCartProps = {
  lines: SaleLine[]
  onIncrease: (itemId: string) => void
  onDecrease: (itemId: string) => void
  onRemove: (itemId: string) => void
  onComplete: () => void
  completingSale: boolean
}

export function SaleCart({
  lines,
  onIncrease,
  onDecrease,
  onRemove,
  onComplete,
  completingSale,
}: SaleCartProps) {
  const total = lines.reduce((sum, line) => sum + line.item.selling_price * line.quantity, 0)
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0)

  return (
    <section className="flex min-h-[520px] flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <ShoppingCart size={19} aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Current sale</h2>
            <p className="text-xs text-slate-500">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} in cart
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {lines.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center text-center">
            <ShoppingCart size={30} className="text-slate-300" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium text-slate-600">Your cart is empty</p>
            <p className="mt-1 max-w-48 text-xs text-slate-400">Select an item to start a new sale.</p>
          </div>
        ) : (
          lines.map((line) => (
            <div key={line.item.id} className="rounded-xl border border-slate-200 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">{line.item.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatCurrency(line.item.selling_price)} each
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(line.item.id)}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  aria-label={`Remove ${line.item.name}`}
                  title={`Remove ${line.item.name}`}
                >
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => onDecrease(line.item.id)}
                    className="p-1.5 text-slate-600 transition hover:text-emerald-600"
                    aria-label={`Decrease ${line.item.name} quantity`}
                  >
                    <Minus size={14} aria-hidden="true" />
                  </button>
                  <span className="min-w-8 text-center text-sm font-semibold text-slate-800">{line.quantity}</span>
                  <button
                    type="button"
                    onClick={() => onIncrease(line.item.id)}
                    disabled={line.quantity >= line.item.stock}
                    className="p-1.5 text-slate-600 transition hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={`Increase ${line.item.name} quantity`}
                  >
                    <Plus size={14} aria-hidden="true" />
                  </button>
                </div>
                <span className="text-sm font-bold text-slate-900">
                  {formatCurrency(line.item.selling_price * line.quantity)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-slate-200 bg-slate-50 p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">Total</span>
          <span className="text-2xl font-bold text-slate-900">{formatCurrency(total)}</span>
        </div>
        <button
          type="button"
          onClick={onComplete}
          disabled={lines.length === 0 || completingSale}
          className="mt-4 flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {completingSale ? 'Updating stock...' : 'Complete sale'}
        </button>
      </div>
    </section>
  )
}
