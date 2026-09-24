import { useEffect, useState } from 'react'

type CategoryFormProps = {
  initialName?: string
  onSubmit: (name: string) => void
  onCancel: () => void
  submitLabel: string
}

export function CategoryForm({
  initialName = '',
  onSubmit,
  onCancel,
  submitLabel,
}: CategoryFormProps) {
  const [name, setName] = useState(initialName)
  const [error, setError] = useState('')

  useEffect(() => {
    setName(initialName)
  }, [initialName])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmed = name.trim()
    if (!trimmed) {
      setError('Category name is required.')
      return
    }

    setError('')
    onSubmit(trimmed)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="category-name" className="mb-1 block text-sm font-medium text-slate-700">
          Name
        </label>
        <input
          id="category-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          placeholder="Drinks"
        />
        {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
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
