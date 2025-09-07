// API Response type for standardized API responses
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  warning?: string
}

// Cart-related types
export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  created_at: string
  updated_at: string
  products?: {
    id: string
    name: string
    price: number
    stock_quantity: number
    [key: string]: unknown
  }
}

export interface CartResponse {
  items: CartItem[]
  itemCount: number
  totalPrice: number
}

// Product types
export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  sku: string | null
  price: number
  compare_at_price: number | null
  category_id: string | null
  collection_id: string | null
  brand: string | null
  material: string | null
  inventory_quantity: number
  stock_quantity: number
  status: string
  is_featured: boolean
  created_at: string
  updated_at: string
}
