import { getProductsServerClient } from '../supabase-multi'

// Export the products client for backward compatibility with existing API routes
export const supabaseProducts = (() => {
  try {
    return getProductsServerClient()
  } catch (error) {
    console.warn('Failed to initialize products client:', error)
    return null
  }
})()

// Export the orders client for backward compatibility with existing API routes
export const supabaseOrders = (() => {
  try {
    const { getOrdersServerClient } = require('../supabase-multi')
    return getOrdersServerClient()
  } catch (error) {
    console.warn('Failed to initialize orders client:', error)
    return null
  }
})()

// Re-export other database clients for convenience
export { 
  getUserServerClient as supabaseUser,
  getOrdersServerClient,
  getProductsServerClient
} from '../supabase-multi'
