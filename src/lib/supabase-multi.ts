import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

// Database Type Definitions
export type Database = 'user' | 'orders' | 'products'

// User Database Types
export interface UserDatabase {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string // Clerk user ID
          email: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          date_of_birth: string | null
          gender: string | null
          avatar_url: string | null
          is_verified: boolean
          email_notifications: boolean
          sms_notifications: boolean
          marketing_notifications: boolean
          preferred_language: string
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          date_of_birth?: string | null
          gender?: string | null
          avatar_url?: string | null
          is_verified?: boolean
          email_notifications?: boolean
          sms_notifications?: boolean
          marketing_notifications?: boolean
          preferred_language?: string
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          date_of_birth?: string | null
          gender?: string | null
          avatar_url?: string | null
          is_verified?: boolean
          email_notifications?: boolean
          sms_notifications?: boolean
          marketing_notifications?: boolean
          preferred_language?: string
          timezone?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_addresses: {
        Row: {
          id: string
          user_id: string // Clerk user ID
          address_type: string
          first_name: string
          last_name: string
          company: string | null
          address_line_1: string
          address_line_2: string | null
          city: string
          state: string
          postal_code: string
          country: string
          phone: string | null
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          address_type?: string
          first_name: string
          last_name: string
          company?: string | null
          address_line_1: string
          address_line_2?: string | null
          city: string
          state: string
          postal_code: string
          country?: string
          phone?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          address_type?: string
          first_name?: string
          last_name?: string
          company?: string | null
          address_line_1?: string
          address_line_2?: string | null
          city?: string
          state?: string
          postal_code?: string
          country?: string
          phone?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Orders Database Types
export interface OrdersDatabase {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string
          user_id: string // Clerk user ID
          order_number: string
          status: string
          subtotal: number
          tax_amount: number
          shipping_amount: number
          discount_amount: number
          total_amount: number
          currency: string
          order_date: string
          // Shipping address fields
          shipping_first_name: string
          shipping_last_name: string
          shipping_address_line_1: string
          shipping_address_line_2: string | null
          shipping_city: string
          shipping_state: string
          shipping_postal_code: string
          shipping_country: string
          shipping_phone: string | null
          // Billing address fields
          billing_first_name: string
          billing_last_name: string
          billing_address_line_1: string
          billing_address_line_2: string | null
          billing_city: string
          billing_state: string
          billing_postal_code: string
          billing_country: string
          billing_phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          order_number?: string
          status?: string
          subtotal?: number
          tax_amount?: number
          shipping_amount?: number
          discount_amount?: number
          total_amount: number
          currency?: string
          order_date?: string
          // Shipping address fields
          shipping_first_name: string
          shipping_last_name: string
          shipping_address_line_1: string
          shipping_address_line_2?: string | null
          shipping_city: string
          shipping_state: string
          shipping_postal_code: string
          shipping_country: string
          shipping_phone?: string | null
          // Billing address fields
          billing_first_name: string
          billing_last_name: string
          billing_address_line_1: string
          billing_address_line_2?: string | null
          billing_city: string
          billing_state: string
          billing_postal_code: string
          billing_country: string
          billing_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          order_number?: string
          status?: string
          subtotal?: number
          tax_amount?: number
          shipping_amount?: number
          discount_amount?: number
          total_amount?: number
          currency?: string
          order_date?: string
          // Shipping address fields
          shipping_first_name?: string
          shipping_last_name?: string
          shipping_address_line_1?: string
          shipping_address_line_2?: string | null
          shipping_city?: string
          shipping_state?: string
          shipping_postal_code?: string
          shipping_country?: string
          shipping_phone?: string | null
          // Billing address fields
          billing_first_name?: string
          billing_last_name?: string
          billing_address_line_1?: string
          billing_address_line_2?: string | null
          billing_city?: string
          billing_state?: string
          billing_postal_code?: string
          billing_country?: string
          billing_phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          product_variant_id: string | null
          product_name: string
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          product_variant_id?: string | null
          product_name: string
          quantity?: number
          unit_price: number
          total_price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          product_variant_id?: string | null
          product_name?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          created_at?: string
        }
      }
    }
  }
}

// Products Database Types
export interface ProductsDatabase {
  public: {
    Tables: {
      products: {
        Row: {
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
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          short_description?: string | null
          sku?: string | null
          price: number
          compare_at_price?: number | null
          category_id?: string | null
          collection_id?: string | null
          brand?: string | null
          material?: string | null
          inventory_quantity?: number
          stock_quantity?: number
          status?: string
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          short_description?: string | null
          sku?: string | null
          price?: number
          compare_at_price?: number | null
          category_id?: string | null
          collection_id?: string | null
          brand?: string | null
          material?: string | null
          inventory_quantity?: number
          stock_quantity?: number
          status?: string
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          parent_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          parent_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          parent_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      shopping_cart: {
        Row: {
          id: string
          user_id: string // Clerk user ID
          product_id: string
          quantity: number
          created_at: string
          updated_at: string
          products?: {
            id: string
            name: string
            price: number
            stock_quantity: number
            [key: string]: any
          }
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Database Configuration
interface DatabaseConfig {
  url: string
  anonKey: string
  serviceRoleKey?: string
}

// Get database configuration
function getDatabaseConfig(database: Database): DatabaseConfig {
  switch (database) {
    case 'user':
      return {
        url: process.env.NEXT_PUBLIC_SUPABASE_USER_URL!,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_USER_ANON_KEY!,
        serviceRoleKey: process.env.SUPABASE_USER_SERVICE_ROLE_KEY,
      }
    case 'orders':
      return {
        url: process.env.NEXT_PUBLIC_SUPABASE_ORDERS_URL!,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ORDERS_ANON_KEY!,
        serviceRoleKey: process.env.SUPABASE_ORDERS_SERVICE_ROLE_KEY,
      }
    case 'products':
      return {
        url: process.env.NEXT_PUBLIC_SUPABASE_PRODUCTS_URL!,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_PRODUCTS_ANON_KEY!,
        serviceRoleKey: process.env.SUPABASE_PRODUCTS_SERVICE_ROLE_KEY,
      }
    default:
      throw new Error(`Invalid database: ${database}`)
  }
}

// Client instances
let userClient: SupabaseClient<UserDatabase> | null = null
let ordersClient: SupabaseClient<OrdersDatabase> | null = null
let productsClient: SupabaseClient<ProductsDatabase> | null = null

// Create or get user database client
export function getUserClient(): SupabaseClient<UserDatabase> {
  if (!userClient) {
    const config = getDatabaseConfig('user')
    userClient = createBrowserClient<UserDatabase>(config.url, config.anonKey)
  }
  return userClient
}

// Create or get orders database client
export function getOrdersClient(): SupabaseClient<OrdersDatabase> {
  if (!ordersClient) {
    const config = getDatabaseConfig('orders')
    ordersClient = createBrowserClient<OrdersDatabase>(config.url, config.anonKey)
  }
  return ordersClient
}

// Create or get products database client
export function getProductsClient(): SupabaseClient<ProductsDatabase> {
  if (!productsClient) {
    const config = getDatabaseConfig('products')
    productsClient = createBrowserClient<ProductsDatabase>(config.url, config.anonKey)
  }
  return productsClient
}

// Server-side clients with service role keys (for API routes)
export function getUserServerClient(): SupabaseClient<UserDatabase> {
  const config = getDatabaseConfig('user')
  return createClient<UserDatabase>(
    config.url,
    config.serviceRoleKey || config.anonKey
  )
}

export function getOrdersServerClient(): SupabaseClient<OrdersDatabase> {
  const config = getDatabaseConfig('orders')
  return createClient<OrdersDatabase>(
    config.url,
    config.serviceRoleKey || config.anonKey
  )
}

export function getProductsServerClient(): SupabaseClient<ProductsDatabase> {
  const config = getDatabaseConfig('products')
  return createClient<ProductsDatabase>(
    config.url,
    config.serviceRoleKey || config.anonKey
  )
}

// Convenience function to get any client
export function getDatabaseClient(database: Database) {
  switch (database) {
    case 'user':
      return getUserClient()
    case 'orders':
      return getOrdersClient()
    case 'products':
      return getProductsClient()
    default:
      throw new Error(`Invalid database: ${database}`)
  }
}

// Export the main user client for backward compatibility
export const supabase = getUserClient()

// Export types for use in other files
export type {
  UserDatabase,
  OrdersDatabase,
  ProductsDatabase,
}

// Additional utility types
export type User = UserDatabase['public']['Tables']['user_profiles']['Row']
export type UserAddress = UserDatabase['public']['Tables']['user_addresses']['Row']
export type Order = OrdersDatabase['public']['Tables']['orders']['Row']
export type OrderItem = OrdersDatabase['public']['Tables']['order_items']['Row']
export type Product = ProductsDatabase['public']['Tables']['products']['Row']
export type Category = ProductsDatabase['public']['Tables']['categories']['Row']
