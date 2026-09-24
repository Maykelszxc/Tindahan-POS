import { supabase } from '../lib/supabase'
import type { CompletedSale, DailySalesReport } from '../types/sale.types'

function getTodayKey(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getDateKey(date: Date): string {
  return getTodayKey(date)
}

const emptyReport = (): DailySalesReport => ({
  date: getTodayKey(),
  transactionCount: 0,
  itemCount: 0,
  totalSales: 0,
})

type SaleRow = {
  id: string
  completed_at: string
  total: number
  sale_lines: Array<{
    item_id: string
    item_name: string
    quantity: number
    unit_price: number
    line_total: number
  }>
}

function mapSaleRow(row: SaleRow): CompletedSale {
  return {
    id: row.id,
    completedAt: row.completed_at,
    total: row.total,
    lines: (row.sale_lines ?? []).map((line) => ({
      itemId: line.item_id,
      itemName: line.item_name,
      quantity: line.quantity,
      unitPrice: line.unit_price,
      lineTotal: line.line_total,
    })),
  }
}

async function fetchSales(): Promise<CompletedSale[]> {
  const { data, error } = await supabase
    .from('sales')
    .select('id, completed_at, total, sale_lines(item_id, item_name, quantity, unit_price, line_total)')
    .order('completed_at', { ascending: false })

  if (error) {
    throw new Error('Unable to load sales history. Please try again.')
  }

  return (data ?? []).map((row) => mapSaleRow(row as SaleRow))
}

export async function getDailySalesReport(): Promise<DailySalesReport> {
  const today = getTodayKey()
  const sales = await getSalesForDate(today)

  if (sales.length === 0) {
    return emptyReport()
  }

  return {
    date: today,
    transactionCount: sales.length,
    itemCount: sales.reduce((sum, sale) => sum + sale.lines.reduce((lineSum, line) => lineSum + line.quantity, 0), 0),
    totalSales: Number(sales.reduce((sum, sale) => sum + sale.total, 0).toFixed(2)),
  }
}

export async function recordSale(sale: CompletedSale): Promise<DailySalesReport> {
  const { error: saleError } = await supabase.from('sales').insert({
    id: sale.id,
    completed_at: sale.completedAt,
    total: sale.total,
  })

  if (saleError) {
    throw new Error('Unable to record sale. Please try again.')
  }

  const { error: linesError } = await supabase.from('sale_lines').insert(
    sale.lines.map((line) => ({
      sale_id: sale.id,
      item_id: line.itemId,
      item_name: line.itemName,
      quantity: line.quantity,
      unit_price: line.unitPrice,
      line_total: line.lineTotal,
    })),
  )

  if (linesError) {
    throw new Error('Unable to record sale items. Please try again.')
  }

  window.dispatchEvent(new Event('tindahan-pos:sale-recorded'))
  return getDailySalesReport()
}

export async function getSalesHistory(): Promise<CompletedSale[]> {
  return fetchSales()
}

export async function getSalesForDate(dateKey: string): Promise<CompletedSale[]> {
  const sales = await fetchSales()
  return sales.filter((sale) => getDateKey(new Date(sale.completedAt)) === dateKey)
}

export async function getSalesForMonth(monthKey: string): Promise<CompletedSale[]> {
  const sales = await fetchSales()
  return sales.filter((sale) => getDateKey(new Date(sale.completedAt)).slice(0, 7) === monthKey)
}

export function getTodayKeyForSales(): string {
  return getTodayKey()
}
