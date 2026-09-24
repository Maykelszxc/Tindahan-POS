import { Check, X } from 'lucide-react'
import type { SaleLine } from '../../types/sale.types'
import { formatCurrency } from '../../utils/calculations'

type SaleReviewModalProps = {
  lines: SaleLine[]
  total: number
  open: boolean
  submitting: boolean
  onClose: () => void
  onProceed: () => void
}

export function SaleReviewModal({
  lines,
  total,
  open,
  submitting,
  onClose,
  onProceed,
}: SaleReviewModalProps) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <div className="flex max-h-[min(700px,90vh)] w-full max-w-xl flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Review sale</h2>
            <p className="mt-1 text-sm text-slate-500">Check the selected products before proceeding.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close sale preview"
            title="Close sale preview"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {lines.map((line) => (
            <div key={line.item.id} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">{line.item.name}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {line.quantity} × {formatCurrency(line.item.selling_price)}
                </p>
              </div>
              <span className="shrink-0 text-sm font-bold text-slate-900">
                {formatCurrency(line.item.selling_price * line.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Total</span>
            <span className="text-2xl font-bold text-slate-900">{formatCurrency(total)}</span>
          </div>
          <button
            type="button"
            onClick={onProceed}
            disabled={submitting}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <Check size={17} aria-hidden="true" />
            {submitting ? 'Processing sale...' : 'Proceed'}
          </button>
        </div>
      </div>
    </div>
  )
}
