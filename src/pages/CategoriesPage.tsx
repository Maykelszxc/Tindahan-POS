import { useEffect, useState } from 'react'
import { CategoryForm } from '../components/categories/CategoryForm'
import { CategoryModal } from '../components/categories/CategoryModal'
import { CategoryTable } from '../components/categories/CategoryTable'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/categoryService'
import type { Category } from '../types/category.types'

type CategoriesPageProps = {
  onNotify: (message: string, type?: 'success' | 'error') => void
}

export function CategoriesPage({ onNotify }: CategoriesPageProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  async function fetchCategories() {
    try {
      setLoading(true)
      const nextCategories = await getCategories()
      setCategories(nextCategories)
    } catch {
      onNotify('Unable to load categories. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchCategories()
  }, [])

  function handleOpenCreate() {
    setEditingCategory(null)
    setIsFormOpen(true)
  }

  function handleOpenEdit(category: Category) {
    setEditingCategory(category)
    setIsFormOpen(true)
  }

  async function handleSubmit(name: string) {
    try {
      if (editingCategory) {
        const updatedCategory = await updateCategory(editingCategory.id, { name })
        setCategories((current) =>
          current.map((category) => (category.id === updatedCategory.id ? updatedCategory : category)),
        )
        onNotify('Category updated successfully.')
      } else {
        const createdCategory = await createCategory({ name })
        setCategories((current) => [createdCategory, ...current])
        onNotify('Category created successfully.')
      }

      setIsFormOpen(false)
      setEditingCategory(null)
    } catch (error) {
      onNotify(error instanceof Error ? error.message : 'Unable to save category. Please try again.', 'error')
    }
  }

  async function handleDelete(category: Category) {
    const confirmed = window.confirm(`Are you sure you want to delete "${category.name}"?`)
    if (!confirmed) {
      return
    }

    try {
      await deleteCategory(category.id)
      setCategories((current) => current.filter((item) => item.id !== category.id))
      onNotify('Category deleted successfully.')
    } catch (error) {
      onNotify(error instanceof Error ? error.message : 'Unable to delete category. Please try again.', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Categories</h1>
          <p className="mt-2 text-sm text-slate-600">Manage product categories for your store.</p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-500"
        >
          + Add Category
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          Loading categories...
        </div>
      ) : (
        <CategoryTable categories={categories} onEdit={handleOpenEdit} onDelete={handleDelete} />
      )}

      <CategoryModal
        open={isFormOpen}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
        onClose={() => {
          setIsFormOpen(false)
          setEditingCategory(null)
        }}
      >
        <CategoryForm
          initialName={editingCategory?.name ?? ''}
          submitLabel={editingCategory ? 'Save Changes' : 'Save Category'}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsFormOpen(false)
            setEditingCategory(null)
          }}
        />
      </CategoryModal>
    </div>
  )
}
