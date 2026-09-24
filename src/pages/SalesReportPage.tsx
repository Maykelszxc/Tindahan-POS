import { CalendarDays, Receipt } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { getSalesForDate } from '../services/salesService'
import type { CompletedSale } from '../types/sale.types'
import { formatCurrency } from '../utils/calculations'

type SalesReportPageProps = {
  onNotify: (message: string, type?: 'success' | 'error') => void
}

function getTodayKey() {
  const today = new Date()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${today.getFullYear()}-${month}-${day}`
}

function formatSelectedDate(value: string) {
  if (!value) {
    return 'Select a date'
  }

  return new Intl.DateTimeFormat('en-PH', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

function formatSaleTime(value: string) {
  return new Intl.DateTimeFormat('en-PH', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export function SalesReportPage({ onNotify }: SalesReportPageProps) {
  const [selectedDate, setSelectedDate] = useState(getTodayKey)
  const [sales, setSales] = useState<CompletedSale[]>([])

  useEffect(() => {
    async function loadSales() {
      try {
        setSales(await getSalesForDate(selectedDate))
      } catch {
        onNotify('Unable to load the sales report.', 'error')
      }
    }

    void loadSales()
  }, [selectedDate, onNotify])

  useEffect(() => {
    function refreshReport() {
      void getSalesForDate(selectedDate).then(setSales)
    }

    window.addEventListener('tindahan-pos:sale-recorded', refreshReport)
    return () => window.removeEventListener('tindahan-pos:sale-recorded', refreshReport)
  }, [selectedDate])

  const summary = useMemo(
    () => ({
      revenue: sales.reduce((sum, sale) => sum + sale.total, 0),
      transactions: sales.length,
      items: sales.reduce(
        (sum, sale) => sum + sale.lines.reduce((lineTotal, line) => lineTotal + line.quantity, 0),
        0,
      ),
    }),
    [sales],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Sales Report</h1>
          <p className="mt-2 text-sm text-slate-600">Review completed sales for any day.</p>
        </div>
        <label className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-3 py-2.5 shadow-sm">
          <CalendarDays size={18} className="text-emerald-600" aria-hidden="true" />
          <span className="sr-only">Choose sales report date</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="bg-transparent text-sm font-medium text-slate-800 outline-none"
          />
        </label>
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="text-sm font-medium text-emerald-800">Selected day</p>
        <p className="mt-1 text-lg font-semibold text-emerald-950">{formatSelectedDate(selectedDate)}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Revenue</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(summary.revenue)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Transactions</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{summary.transactions}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Items sold</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{summary.items}</p>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <Receipt size={19} aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Completed sales</h2>
            <p className="mt-1 text-xs text-slate-500">Every transaction recorded on the selected date.</p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {sales.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">
              No completed sales for this date.
            </div>
          ) : (
            sales
              .slice()
              .sort((first, second) => second.completedAt.localeCompare(first.completedAt))
              .map((sale) => (
                <div key={sale.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Sale #{sale.id.slice(-6)}</p>
                      <p className="mt-1 text-xs text-slate-500">Completed at {formatSaleTime(sale.completedAt)}</p>
                    </div>
                    <span className="text-sm font-bold text-emerald-700">{formatCurrency(sale.total)}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {sale.lines.map((line) => (
                      <span key={line.itemId} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                        {line.itemName} × {line.quantity}
                      </span>
                    ))}
                  </div>
                </div>
              ))
          )}
        </div>
      </section>
    </div>
  )
}
