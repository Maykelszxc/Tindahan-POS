export interface Category {
  id: string
  name: string
  created_at: string
}

export type CategoryInsert = {
  name: string
}

export type CategoryUpdate = Partial<CategoryInsert>
