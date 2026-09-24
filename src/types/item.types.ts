export interface Item {
  id: string
  category_id: string
  category_name?: string
  name: string
  buying_price: number
  selling_price: number
  stock: number
  created_at: string
  updated_at: string
}

export type ItemInsert = {
  category_id: string
  name: string
  buying_price: number
  selling_price: number
  stock: number
}

export type ItemUpdate = Partial<ItemInsert>
