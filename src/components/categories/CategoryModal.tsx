import type { ReactNode } from 'react'

type CategoryModalProps = {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
}

export function CategoryModal({ open, title, children, onClose }: CategoryModalProps) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-2 py-1 text-sm text-slate-500 hover:bg-slate-50"
            aria-label="Close category form"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
