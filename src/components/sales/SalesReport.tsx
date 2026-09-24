import { CalendarDays, Receipt } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { getSalesHistory } from '../../services/salesService'
import type { CompletedSale } from '../../types/sale.types'
import { formatCurrency } from '../../utils/calculations'

type ReportRange = 'today' | 'week' | 'month'

const rangeLabels: Record<ReportRange, string> = {
  today: 'Today',
  week: 'This week',
  month: 'This month',
}

function startOfRange(range: ReportRange, now = new Date()) {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)

  if (range === 'week') {
    const day = start.getDay()
    start.setDate(start.getDate() - day)
  }

  if (range === 'month') {
    start.setDate(1)
  }

  return start
}

function formatSaleTime(value: string) {
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

type SalesReportProps = {
  dailySales: {
    transactionCount: number
    itemCount: number
    totalSales: number
  }
}

export function SalesReport({ dailySales }: SalesReportProps) {
  const [range, setRange] = useState<ReportRange>('today')
  const [sales, setSales] = useState<CompletedSale[]>([])

  function refreshSales() {
    void getSalesHistory().then(setSales)
  }

  useEffect(() => {
    refreshSales()
    window.addEventListener('tindahan-pos:sale-recorded', refreshSales)
    return () => window.removeEventListener('tindahan-pos:sale-recorded', refreshSales)
  }, [])

  const periodSales = useMemo(() => {
    const start = startOfRange(range)
    return sales.filter((sale) => new Date(sale.completedAt) >= start)
  }, [range, sales])

  const summary = useMemo(() => {
    if (range === 'today') {
      return dailySales
    }

    return periodSales.reduce(
      (result, sale) => ({
        transactionCount: result.transactionCount + 1,
        itemCount: result.itemCount + sale.lines.reduce((sum, line) => sum + line.quantity, 0),
        totalSales: result.totalSales + sale.total,
      }),
      { transactionCount: 0, itemCount: 0, totalSales: 0 },
    )
  }, [dailySales, periodSales, range])

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Receipt size={19} aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Sales report</h2>
            <p className="mt-1 text-xs text-slate-500">Review completed sales by period.</p>
          </div>
        </div>
        <div className="flex rounded-xl bg-slate-100 p-1">
          {(Object.keys(rangeLabels) as ReportRange[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setRange(option)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                range === option ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {rangeLabels[option]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-emerald-50 p-3">
          <p className="text-xs text-emerald-700">Revenue</p>
          <p className="mt-1 text-lg font-bold text-emerald-950">{formatCurrency(summary.totalSales)}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Transactions</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{summary.transactionCount}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Items sold</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{summary.itemCount}</p>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {periodSales.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
            <CalendarDays size={24} className="mx-auto text-slate-300" aria-hidden="true" />
            <p className="mt-2 text-sm font-medium text-slate-600">No sales for {rangeLabels[range].toLowerCase()}.</p>
          </div>
        ) : (
          periodSales
            .slice()
            .sort((first, second) => second.completedAt.localeCompare(first.completedAt))
            .map((sale) => (
              <div key={sale.id} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">Sale #{sale.id.slice(-6)}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatSaleTime(sale.completedAt)} · {sale.lines.reduce((sum, line) => sum + line.quantity, 0)} items
                  </p>
                </div>
                <span className="shrink-0 text-sm font-bold text-emerald-700">{formatCurrency(sale.total)}</span>
              </div>
            ))
        )}
      </div>
    </section>
  )
}
