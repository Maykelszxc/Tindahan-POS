export const AppPage = {
  Dashboard: 'dashboard',
  Sales: 'sales',
  SalesReport: 'sales-report',
  MonthlyReport: 'monthly-report',
  LowStocks: 'low-stocks',
  Expenses: 'expenses',
  Items: 'items',
  Categories: 'categories',
} as const

export type AppPageKey = (typeof AppPage)[keyof typeof AppPage]
