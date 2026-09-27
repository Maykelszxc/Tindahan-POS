import { useEffect, useMemo, useState } from 'react'
import type { Category } from '../../types/category.types'
import type { Item } from '../../types/item.types'
import { calculateProfit, formatCurrency } from '../../utils/calculations'

type ItemFormProps = {
  categories: Category[]
  initialValues?: Partial<Item>
  onSubmit: (values: {
    category_id: string
    name: string
    buying_price: number
    selling_price: number
    stock: number
  }) => void
  onCancel: () => void
  submitLabel: string
}

type FormErrors = {
  name?: string
  category_id?: string
  buying_price?: string
  profit_margin?: string
  stock?: string
}

const initialFormState = {
  category_id: '',
  name: '',
  buying_price: '',
  profit_margin: '',
  stock: '',
}

export function ItemForm({
  categories,
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
}: ItemFormProps) {
  const [form, setForm] = useState(initialFormState)
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (!initialValues) {
      setForm(initialFormState)
      return
    }

    setForm({
      category_id: initialValues.category_id ?? '',
      name: initialValues.name ?? '',
      buying_price: initialValues.buying_price != null ? String(initialValues.buying_price) : '',
      profit_margin:
        initialValues.buying_price != null && initialValues.buying_price > 0 && initialValues.selling_price != null
          ? String(Number((((initialValues.selling_price - initialValues.buying_price) / initialValues.buying_price) * 100).toFixed(2)))
          : '0',
      stock: initialValues.stock != null ? String(initialValues.stock) : '',
    })
  }, [initialValues])

  const buyingValue = Number(form.buying_price || 0)
  const marginValue = Number(form.profit_margin || 0)
  const sellingValue = Number((buyingValue * (1 + marginValue / 100)).toFixed(2))

  const preview = useMemo(() => {
    const profit = calculateProfit(buyingValue, sellingValue)
    return { profit, sellingPrice: sellingValue }
  }, [buyingValue, sellingValue])

  function updateField(field: keyof typeof initialFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function validate() {
    const nextErrors: FormErrors = {}
    const trimmedName = form.name.trim()
    const buyingPrice = Number(form.buying_price)
    const profitMargin = Number(form.profit_margin)
    const stock = Number(form.stock)

    if (!trimmedName) {
      nextErrors.name = 'Item name is required.'
    }

    if (!form.category_id) {
      nextErrors.category_id = 'Category is required.'
    }

    if (form.buying_price === '' || Number.isNaN(buyingPrice) || buyingPrice < 0) {
      nextErrors.buying_price = 'Buying price is required and must be 0 or more.'
    }

    if (form.profit_margin === '' || Number.isNaN(profitMargin) || profitMargin < 0) {
      nextErrors.profit_margin = 'Profit margin is required and must be 0% or more.'
    }

    if (form.stock === '' || !Number.isInteger(stock) || stock < 0) {
      nextErrors.stock = 'Stock is required and must be a valid non-negative integer.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!validate()) {
      return
    }

    onSubmit({
      category_id: form.category_id,
      name: form.name.trim(),
      buying_price: Number(form.buying_price),
      selling_price: Number((Number(form.buying_price) * (1 + Number(form.profit_margin) / 100)).toFixed(2)),
      stock: Number(form.stock),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="item-name" className="mb-1 block text-sm font-medium text-slate-700">
          Item Name
        </label>
        <input
          id="item-name"
          type="text"
          value={form.name}
          onChange={(event) => updateField('name', event.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          placeholder="Coca-Cola 1.5L"
        />
        {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name}</p> : null}
      </div>

      <div>
        <label htmlFor="item-category" className="mb-1 block text-sm font-medium text-slate-700">
          Category
        </label>
        <select
          id="item-category"
          value={form.category_id}
          onChange={(event) => updateField('category_id', event.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="">Select category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.category_id ? <p className="mt-1 text-xs text-red-600">{errors.category_id}</p> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="item-buying" className="mb-1 block text-sm font-medium text-slate-700">
            Buying Price
          </label>
          <input
            id="item-buying"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={form.buying_price}
            onChange={(event) => updateField('buying_price', event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            placeholder="45.00"
          />
          {errors.buying_price ? (
            <p className="mt-1 text-xs text-red-600">{errors.buying_price}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="item-margin" className="mb-1 block text-sm font-medium text-slate-700">
            Profit Margin (%)
          </label>
          <input
            id="item-margin"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={form.profit_margin}
            onChange={(event) => updateField('profit_margin', event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            placeholder="10"
          />
          {errors.profit_margin ? (
            <p className="mt-1 text-xs text-red-600">{errors.profit_margin}</p>
          ) : null}
          <p className="mt-1 text-xs text-slate-500">Added to the buying price.</p>
        </div>
      </div>

      <div>
        <label htmlFor="item-stock" className="mb-1 block text-sm font-medium text-slate-700">
          Stock
        </label>
        <input
          id="item-stock"
          type="number"
          min="0"
          step="1"
          value={form.stock}
          onChange={(event) => updateField('stock', event.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          placeholder="20"
        />
        {errors.stock ? <p className="mt-1 text-xs text-red-600">{errors.stock}</p> : null}
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Selling price</span>
          <span className="font-semibold text-slate-900">{formatCurrency(preview.sellingPrice)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
          <span>Profit per item</span>
          <span className="font-semibold text-slate-900">{formatCurrency(preview.profit)}</span>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
