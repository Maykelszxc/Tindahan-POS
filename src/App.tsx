import { ChevronDown, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { DashboardPage } from './pages/DashboardPage'
import { ItemsPage } from './pages/ItemsPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { SalesPage } from './pages/SalesPage'
import { SalesReportPage } from './pages/SalesReportPage'
import { MonthlyReportPage } from './pages/MonthlyReportPage'
import { LowStocksPage } from './pages/LowStocksPage'
import { ExpensesPage } from './pages/ExpensesPage'
import { getCategories } from './services/categoryService'
import { getItems } from './services/itemService'
import { getDailySalesReport } from './services/salesService'
import { AppPage, type AppPageKey } from './enums/common.enums'
import type { Category } from './types/category.types'
import type { Item } from './types/item.types'
import type { DailySalesReport } from './types/sale.types'

function App() {
  const [activePage, setActivePage] = useState<AppPageKey>(AppPage.Dashboard)
  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [dailySales, setDailySales] = useState<DailySalesReport>({
    date: '',
    transactionCount: 0,
    itemCount: 0,
    totalSales: 0,
  })
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const reportPages: AppPageKey[] = [AppPage.SalesReport, AppPage.Expenses, AppPage.MonthlyReport]
  const [isReportMenuOpen, setIsReportMenuOpen] = useState(false)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  async function loadInitialData() {
    try {
      const [itemsResponse, categoriesResponse, dailySalesResponse] = await Promise.all([
        getItems(),
        getCategories(),
        getDailySalesReport(),
      ])
      setItems(itemsResponse)
      setCategories(categoriesResponse)
      setDailySales(dailySalesResponse)
    } catch {
      setNotification({ message: 'Unable to load store data. Please try again.', type: 'error' })
    }
  }

  useEffect(() => {
    void loadInitialData()
  }, [])

  useEffect(() => {
    if (!notification) {
      return
    }

    const timer = window.setTimeout(() => setNotification(null), 2800)
    return () => window.clearTimeout(timer)
  }, [notification])

  useEffect(() => {
    const timer = window.setInterval(() => {
      void getDailySalesReport().then(setDailySales)
    }, 30000)

    return () => window.clearInterval(timer)
  }, [])

  function handleSaleCompleted(updatedItems: Item[], report: DailySalesReport) {
    setItems((current) =>
      current.map((item) => updatedItems.find((updatedItem) => updatedItem.id === item.id) ?? item),
    )
    setDailySales(report)
  }

  function renderPage() {
    if (activePage === AppPage.Sales) {
      return <SalesPage onNotify={showToast} onSaleCompleted={handleSaleCompleted} />
    }

    if (activePage === AppPage.SalesReport) {
      return <SalesReportPage onNotify={showToast} />
    }

    if (activePage === AppPage.MonthlyReport) {
      return <MonthlyReportPage onNotify={showToast} />
    }

    if (activePage === AppPage.LowStocks) {
      return <LowStocksPage onNotify={showToast} />
    }

    if (activePage === AppPage.Expenses) {
      return <ExpensesPage onNotify={showToast} />
    }

    if (activePage === AppPage.Items) {
      return <ItemsPage onNotify={showToast} />
    }

    if (activePage === AppPage.Categories) {
      return <CategoriesPage onNotify={showToast} />
    }

    return <DashboardPage items={items} categories={categories} dailySales={dailySales} />
  }

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setNotification({ message, type })
  }

  function navigateTo(page: AppPageKey) {
    setActivePage(page)
    setIsMobileNavOpen(false)
  }

  function renderNavLinks() {
    return (
      <>
        {[
          { key: AppPage.Dashboard, label: 'Dashboard' },
          { key: AppPage.Sales, label: 'New Sale' },
          { key: AppPage.LowStocks, label: 'Low Stocks' },
          { key: AppPage.Items, label: 'Items' },
          { key: AppPage.Categories, label: 'Categories' },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => navigateTo(item.key)}
            className={`rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
              activePage === item.key
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {item.label}
          </button>
        ))}

        <div>
          <button
            type="button"
            onClick={() => setIsReportMenuOpen((current) => !current)}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
              reportPages.includes(activePage)
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            Report
            <ChevronDown
              size={16}
              className={`transition-transform ${isReportMenuOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>

          {isReportMenuOpen ? (
            <div className="mt-1 flex flex-col gap-1 pl-3">
              {[
                { key: AppPage.SalesReport, label: 'Sales Report' },
                { key: AppPage.Expenses, label: 'Expenses' },
                { key: AppPage.MonthlyReport, label: 'Monthly Report' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => navigateTo(item.key)}
                  className={`rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                    activePage === item.key
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 shadow-sm lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-base font-bold text-white">
            ₱
          </div>
          <h1 className="text-lg font-bold text-slate-900">Tindahan POS</h1>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileNavOpen(true)}
          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
          aria-label="Open menu"
        >
          <Menu size={22} aria-hidden="true" />
        </button>
      </div>

      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <aside className="hidden border-r border-slate-200 bg-white px-4 py-5 shadow-sm lg:block lg:w-72">
          <div className="mb-8 flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-lg font-bold text-white">
              ₱
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Tindahan POS</h1>
            </div>
          </div>

          <nav className="flex flex-col gap-2">{renderNavLinks()}</nav>
        </aside>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="rounded-3xl bg-slate-50 p-4 sm:p-6 lg:p-8">{renderPage()}</div>
        </main>
      </div>

      {isMobileNavOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setIsMobileNavOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[80%] flex-col overflow-y-auto bg-white px-4 py-5 shadow-xl">
            <div className="mb-6 flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-lg font-bold text-white">
                  ₱
                </div>
                <h1 className="text-xl font-bold text-slate-900">Tindahan POS</h1>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(false)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                aria-label="Close menu"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <nav className="flex flex-col gap-2">{renderNavLinks()}</nav>
          </aside>
        </div>
      ) : null}

      {notification ? (
        <div className="fixed bottom-5 right-5 z-50">
          <div
            className={`rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
              notification.type === 'success'
                ? 'bg-emerald-600 text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            {notification.message}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default App
