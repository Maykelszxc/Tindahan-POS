import { supabase } from '../lib/supabase'
import type { Item, ItemInsert, ItemUpdate } from '../types/item.types'

export async function getItems(): Promise<Item[]> {
  const { data, error } = await supabase
    .from('items')
    .select('*, categories(name)')
    .order('name', { ascending: true })

  if (error) {
    throw new Error('Unable to load items. Please try again.')
  }

  return (data ?? []).map((item) => ({
    ...item,
    category_name: item.categories?.name ?? '',
  })) as Item[]
}

export async function getItemById(id: string): Promise<Item | null> {
  const { data, error } = await supabase.from('items').select('*').eq('id', id).single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }

    throw new Error('Unable to load item.')
  }

  return data as Item
}

export async function createItem(payload: ItemInsert): Promise<Item> {
  const { data, error } = await supabase.from('items').insert(payload).select().single()

  if (error) {
    throw new Error('Unable to create item. Please try again.')
  }

  return data as Item
}

export async function updateItem(id: string, payload: ItemUpdate): Promise<Item> {
  const { data, error } = await supabase
    .from('items')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error('Unable to update item. Please try again.')
  }

  return data as Item
}

export async function deleteItem(id: string): Promise<void> {
  const { error } = await supabase.from('items').delete().eq('id', id)

  if (error) {
    if (error.message.toLowerCase().includes('foreign key') || error.message.toLowerCase().includes('violates')) {
      throw new Error(
        'Cannot delete this item because it is referenced by existing sales or records. Run the latest supabase/schema.sql migration, then try again.',
      )
    }

    throw new Error('Unable to delete item. Please try again.')
  }
}
