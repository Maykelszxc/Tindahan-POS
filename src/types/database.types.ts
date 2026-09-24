export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      items: {
        Row: {
          id: string
          category_id: string
          name: string
          buying_price: number
          selling_price: number
          stock: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          name: string
          buying_price: number
          selling_price: number
          stock?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          name?: string
          buying_price?: number
          selling_price?: number
          stock?: number
          created_at?: string
          updated_at?: string
        }
      }
      sales: {
        Row: {
          id: string
          completed_at: string
          total: number
          created_at: string
        }
        Insert: {
          id?: string
          completed_at: string
          total: number
          created_at?: string
        }
        Update: {
          id?: string
          completed_at?: string
          total?: number
          created_at?: string
        }
      }
      sale_lines: {
        Row: {
          id: string
          sale_id: string
          item_id: string
          item_name: string
          quantity: number
          unit_price: number
          line_total: number
        }
        Insert: {
          id?: string
          sale_id: string
          item_id: string
          item_name: string
          quantity: number
          unit_price: number
          line_total: number
        }
        Update: {
          id?: string
          sale_id?: string
          item_id?: string
          item_name?: string
          quantity?: number
          unit_price?: number
          line_total?: number
        }
      }
      expenses: {
        Row: {
          id: string
          category: string
          description: string
          amount: number
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          category: string
          description: string
          amount: number
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          category?: string
          description?: string
          amount?: number
          date?: string
          created_at?: string
        }
      }
    }
  }
}
