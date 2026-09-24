import { CalendarDays, Receipt } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { addExpense, getExpenses } from '../services/expenseService'
import type { Expense } from '../types/expense.types'
import { formatCurrency } from '../utils/calculations'

type ExpensesPageProps = {
  onNotify: (message: string, type?: 'success' | 'error') => void
}

function getTodayKey() {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

export function ExpensesPage({ onNotify }: ExpensesPageProps) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(getTodayKey)

  useEffect(() => {
    async function loadExpenses() {
      try {
        setExpenses(await getExpenses())
      } catch {
        onNotify('Unable to load expenses.', 'error')
      }
    }

    void loadExpenses()
  }, [onNotify])

  const total = useMemo(() => expenses.reduce((sum, expense) => sum + expense.amount, 0), [expenses])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsedAmount = Number(amount)

    if (!category.trim() || !description.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      onNotify('Enter an expense type, description, and a valid amount.', 'error')
      return
    }

    try {
      const expense = await addExpense({
        category: category.trim(),
        description: description.trim(),
        amount: parsedAmount,
        date,
      })
      setExpenses((current) => [expense, ...current])
      setCategory('')
      setDescription('')
      setAmount('')
      onNotify('Expense recorded successfully.')
    } catch (error) {
      onNotify(error instanceof Error ? error.message : 'Unable to record expense. Please try again.', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Expenses</h1>
        <p className="mt-2 text-sm text-slate-600">Track rent, utilities, and other store expenses.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <form onSubmit={(event) => void handleSubmit(event)} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Receipt size={19} aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Record expense</h2>
              <p className="text-xs text-slate-500">Add a cost to your store ledger.</p>
            </div>
          </div>

          <label className="mt-5 block text-sm font-medium text-slate-700">
            Expense type
            <input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="e.g. Rent, Water, Electricity" className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
          </label>

          <label className="mt-4 block text-sm font-medium text-slate-700">
            Description
            <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="e.g. September rent" className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
          </label>

          <label className="mt-4 block text-sm font-medium text-slate-700">
            Amount
            <input type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
          </label>

          <label className="mt-4 block text-sm font-medium text-slate-700">
            Date
            <span className="relative mt-2 block">
              <CalendarDays size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
            </span>
          </label>

          <button type="submit" className="mt-5 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500">Save expense</button>
        </form>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-semibold text-slate-900">Expense history</h2>
              <p className="mt-1 text-xs text-slate-500">All recorded store expenses.</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Total expenses</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{formatCurrency(total)}</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {expenses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">No expenses recorded yet.</div>
            ) : expenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-slate-800">{expense.description}</p>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{expense.category}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{expense.date}</p>
                </div>
                <span className="shrink-0 text-sm font-bold text-slate-900">{formatCurrency(expense.amount)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}