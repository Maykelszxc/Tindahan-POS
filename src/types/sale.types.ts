import type { Item } from './item.types'

export type SaleLine = {
  item: Item
  quantity: number
}

export type CompletedSale = {
  id: string
  completedAt: string
  total: number
  lines: Array<{
    itemId: string
    itemName: string
    quantity: number
    unitPrice: number
    lineTotal: number
  }>
}

export type DailySalesReport = {
  date: string
  transactionCount: number
  itemCount: number
  totalSales: number
}
