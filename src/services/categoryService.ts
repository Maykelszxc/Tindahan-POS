import { supabase } from '../lib/supabase'
import type { Category, CategoryInsert, CategoryUpdate } from '../types/category.types'

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true })

  if (error) {
    throw new Error('Unable to load categories. Please try again.')
  }

  return (data ?? []) as Category[]
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const { data, error } = await supabase.from('categories').select('*').eq('id', id).single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }

    throw new Error('Unable to load category.')
  }

  return data as Category | null
}

export async function createCategory(payload: CategoryInsert): Promise<Category> {
  const { data, error } = await supabase.from('categories').insert(payload).select().single()

  if (error) {
    throw new Error('Unable to create category. Please try again.')
  }

  return data as Category
}

export async function updateCategory(id: string, payload: CategoryUpdate): Promise<Category> {
  const { data, error } = await supabase.from('categories').update(payload).eq('id', id).select().single()

  if (error) {
    throw new Error('Unable to update category. Please try again.')
  }

  return data as Category
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id)

  if (error) {
    if (error.message.toLowerCase().includes('foreign key') || error.message.toLowerCase().includes('still')) {
      throw new Error('Cannot delete this category. There are still items assigned to this category. Please move those items to another category first.')
    }

    throw new Error('Unable to delete category. Please try again.')
  }
}

