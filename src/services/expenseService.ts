import { supabase } from '../lib/supabase'
import type { Expense } from '../types/expense.types'

type ExpenseRow = {
  id: string
  category: string
  description: string
  amount: number
  date: string
  created_at: string
}

function mapExpenseRow(row: ExpenseRow): Expense {
  return {
    id: row.id,
    category: row.category,
    description: row.description,
    amount: row.amount,
    date: row.date,
    createdAt: row.created_at,
  }
}

export async function getExpenses(): Promise<Expense[]> {
  const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false })

  if (error) {
    throw new Error('Unable to load expenses. Please try again.')
  }

  return (data ?? []).map((row) => mapExpenseRow(row as ExpenseRow))
}

export async function addExpense(expense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> {
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      date: expense.date,
    })
    .select()
    .single()

  if (error) {
    throw new Error('Unable to record expense. Please try again.')
  }

  return mapExpenseRow(data as ExpenseRow)
}

export async function getExpensesForMonth(monthKey: string): Promise<Expense[]> {
  const expenses = await getExpenses()
  return expenses.filter((expense) => expense.date.slice(0, 7) === monthKey)
}