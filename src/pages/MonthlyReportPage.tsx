import { CalendarRange, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { getExpensesForMonth } from '../services/expenseService'
import { getSalesForMonth } from '../services/salesService'
import type { CompletedSale } from '../types/sale.types'
import type { Expense } from '../types/expense.types'
import { formatCurrency } from '../utils/calculations'

type MonthlyReportPageProps = {
  onNotify: (message: string, type?: 'success' | 'error') => void
}

function getCurrentMonthKey() {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
}

function formatSelectedMonth(monthKey: string) {
  if (!monthKey) {
    return 'Select a month'
  }

  return new Intl.DateTimeFormat('en-PH', { month: 'long', year: 'numeric' }).format(
    new Date(`${monthKey}-01T00:00:00`),
  )
}

export function MonthlyReportPage({ onNotify }: MonthlyReportPageProps) {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey)
  const [sales, setSales] = useState<CompletedSale[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])

  useEffect(() => {
    async function loadReport() {
      try {
        const [salesResponse, expensesResponse] = await Promise.all([
          getSalesForMonth(selectedMonth),
          getExpensesForMonth(selectedMonth),
        ])
        setSales(salesResponse)
        setExpenses(expensesResponse)
      } catch {
        onNotify('Unable to load the monthly report.', 'error')
      }
    }

    void loadReport()
  }, [selectedMonth, onNotify])

  useEffect(() => {
    function refreshReport() {
      void getSalesForMonth(selectedMonth).then(setSales)
    }

    window.addEventListener('tindahan-pos:sale-recorded', refreshReport)
    return () => window.removeEventListener('tindahan-pos:sale-recorded', refreshReport)
  }, [selectedMonth])

  const summary = useMemo(() => {
    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0)
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    return {
      totalSales,
      totalExpenses,
      earnings: Number((totalSales - totalExpenses).toFixed(2)),
    }
  }, [sales, expenses])

  const expensesByCategory = useMemo(() => {
    const grouped = new Map<string, number>()
    for (const expense of expenses) {
      grouped.set(expense.category, (grouped.get(expense.category) ?? 0) + expense.amount)
    }
    return Array.from(grouped.entries()).sort((first, second) => second[1] - first[1])
  }, [expenses])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Monthly Report</h1>
          <p className="mt-2 text-sm text-slate-600">Compare sales and expenses to see your earnings for the month.</p>
        </div>
        <label className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-3 py-2.5 shadow-sm">
          <CalendarRange size={18} className="text-emerald-600" aria-hidden="true" />
          <span className="sr-only">Choose report month</span>
          <input
            type="month"
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
            className="bg-transparent text-sm font-medium text-slate-800 outline-none"
          />
        </label>
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="text-sm font-medium text-emerald-800">Selected month</p>
        <p className="mt-1 text-lg font-semibold text-emerald-950">{formatSelectedMonth(selectedMonth)}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <TrendingUp size={16} className="text-emerald-600" aria-hidden="true" />
            <p className="text-sm">Total sales</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(summary.totalSales)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <TrendingDown size={16} className="text-red-500" aria-hidden="true" />
            <p className="text-sm">Total expenses</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(summary.totalExpenses)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <Wallet size={16} className="text-slate-600" aria-hidden="true" />
            <p className="text-sm">Earnings</p>
          </div>
          <p className={`mt-2 text-2xl font-bold ${summary.earnings >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
            {formatCurrency(summary.earnings)}
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900">Expenses by type</h2>
        <p className="mt-1 text-xs text-slate-500">Breakdown of costs recorded for the selected month.</p>

        <div className="mt-4 space-y-3">
          {expensesByCategory.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
              No expenses recorded for this month.
            </div>
          ) : (
            expensesByCategory.map(([category, amount]) => (
              <div key={category} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <span className="text-sm font-medium text-slate-700">{category}</span>
                <span className="text-sm font-bold text-slate-900">{formatCurrency(amount)}</span>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900">Summary</h2>
        <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
          <p>{sales.length} completed {sales.length === 1 ? 'sale' : 'sales'}</p>
          <p>{expenses.length} recorded {expenses.length === 1 ? 'expense' : 'expenses'}</p>
          <p>
            {sales.reduce((sum, sale) => sum + sale.lines.reduce((lineSum, line) => lineSum + line.quantity, 0), 0)} items sold
          </p>
        </div>
      </section>
    </div>
  )
}
