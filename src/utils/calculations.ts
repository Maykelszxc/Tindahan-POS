export function calculateProfit(buyingPrice: number, sellingPrice: number): number {
  return Number((sellingPrice - buyingPrice).toFixed(2))
}

export function calculateProfitMargin(buyingPrice: number, sellingPrice: number): number {
  if (sellingPrice === 0) {
    return 0
  }

  const profit = calculateProfit(buyingPrice, sellingPrice)
  return Number(((profit / sellingPrice) * 100).toFixed(2))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`
}
