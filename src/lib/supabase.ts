import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  compare_at_price?: number
  category_id: string
  status: 'active' | 'draft' | 'archived'
  is_featured: boolean
  images: ProductImage[]
  category: Category
  variants: ProductVariant[]
  created_at: string
  updated_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  alt_text?: string
  sort_order: number
  is_main: boolean
}

export interface ProductVariant {
  id: string
  product_id: string
  name: string
  price?: number
  compare_at_price?: number
  quantity: number
  options: Record<string, any>
  is_active: boolean
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  variant_id?: string
  quantity: number
  product: Product
  variant?: ProductVariant
}

export interface Order {
  id: string
  user_id: string
  order_number: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  payment_status: 'pending' | 'completed' | 'failed'
  subtotal: number
  tax_amount: number
  shipping_amount: number
  total_amount: number
  items: OrderItem[]
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  variant_id?: string
  quantity: number
  price: number
  total_price: number
  product_name: string
}
