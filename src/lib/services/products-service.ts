import { getProductsClient, getProductsServerClient, Product, Category } from '@/lib/supabase-multi'

export interface ProductFilters {
  category_id?: string
  collection_id?: string
  min_price?: number
  max_price?: number
  brand?: string
  is_featured?: boolean
  search?: string
  status?: string
}

export class ProductsService {
  // Get all products with filters
  static async getProducts(filters: ProductFilters = {}, limit = 20, offset = 0) {
    const supabase = getProductsClient()
    let query = supabase
      .from('products')
      .select(`
        *,
        categories (*),
        collections (*),
        product_images (*)
      `)

    // Apply filters
    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id)
    }
    if (filters.collection_id) {
      query = query.eq('collection_id', filters.collection_id)
    }
    if (filters.min_price) {
      query = query.gte('price', filters.min_price)
    }
    if (filters.max_price) {
      query = query.lte('price', filters.max_price)
    }
    if (filters.brand) {
      query = query.eq('brand', filters.brand)
    }
    if (filters.is_featured) {
      query = query.eq('is_featured', filters.is_featured)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    } else {
      // Default to active products only
      query = query.eq('status', 'active')
    }

    // Apply search if provided
    if (filters.search) {
      // Use full-text search
      const { data: searchResults, error: searchError } = await supabase
        .from('product_search')
        .select('product_id')
        .textSearch('search_vector', filters.search)

      if (!searchError && searchResults) {
        const productIds = searchResults.map(r => r.product_id)
        if (productIds.length > 0) {
          query = query.in('id', productIds)
        } else {
          // No search results found
          return { data: [], error: null }
        }
      }
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    return { data, error }
  }

  // Get featured products
  static async getFeaturedProducts(limit = 12) {
    return this.getProducts({ is_featured: true, status: 'active' }, limit)
  }

  // Get single product by ID
  static async getProduct(productId: string) {
    const supabase = getProductsClient()
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (*),
        collections (*),
        product_images (*),
        product_variants (*),
        product_reviews (
          *,
          user_id
        ),
        product_attribute_values (
          *,
          product_attributes (*)
        )
      `)
      .eq('id', productId)
      .single()

    return { data, error }
  }

  // Get product by slug
  static async getProductBySlug(slug: string) {
    const supabase = getProductsClient()
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (*),
        collections (*),
        product_images (*),
        product_variants (*),
        product_reviews (
          *,
          user_id
        ),
        product_attribute_values (
          *,
          product_attributes (*)
        )
      `)
      .eq('slug', slug)
      .eq('status', 'active')
      .single()

    return { data, error }
  }

  // Get related products
  static async getRelatedProducts(productId: string, categoryId?: string, limit = 8) {
    const supabase = getProductsClient()
    let query = supabase
      .from('products')
      .select(`
        *,
        categories (*),
        product_images (*)
      `)
      .neq('id', productId)
      .eq('status', 'active')

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit)

    return { data, error }
  }

  // Get all categories
  static async getCategories() {
    const supabase = getProductsClient()
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    return { data, error }
  }

  // Get category by slug
  static async getCategoryBySlug(slug: string) {
    const supabase = getProductsClient()
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    return { data, error }
  }

  // Get all collections
  static async getCollections() {
    const supabase = getProductsClient()
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    return { data, error }
  }

  // Get collection by slug
  static async getCollectionBySlug(slug: string) {
    const supabase = getProductsClient()
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    return { data, error }
  }

  // Add to wishlist
  static async addToWishlist(userId: string, productId: string, variantId?: string) {
    const supabase = getProductsClient()
    const { data, error } = await supabase
      .from('wishlists')
      .insert({
        user_id: userId,
        product_id: productId,
        product_variant_id: variantId
      })
      .select()
      .single()

    return { data, error }
  }

  // Remove from wishlist
  static async removeFromWishlist(userId: string, productId: string, variantId?: string) {
    const supabase = getProductsClient()
    let query = supabase
      .from('wishlists')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId)

    if (variantId) {
      query = query.eq('product_variant_id', variantId)
    } else {
      query = query.is('product_variant_id', null)
    }

    const { error } = await query
    return { error }
  }

  // Get user wishlist
  static async getUserWishlist(userId: string) {
    const supabase = getProductsClient()
    const { data, error } = await supabase
      .from('wishlists')
      .select(`
        *,
        products (*),
        product_variants (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    return { data, error }
  }

  // Add to cart
  static async addToCart(userId: string | null, sessionId: string | null, productId: string, variantId?: string, quantity = 1) {
    const supabase = getProductsClient()
    
    // Check if item already exists in cart
    let existingQuery = supabase
      .from('shopping_cart')
      .select('*')
      .eq('product_id', productId)

    if (userId) {
      existingQuery = existingQuery.eq('user_id', userId)
    } else {
      existingQuery = existingQuery.eq('session_id', sessionId)
    }

    if (variantId) {
      existingQuery = existingQuery.eq('product_variant_id', variantId)
    } else {
      existingQuery = existingQuery.is('product_variant_id', null)
    }

    const { data: existing, error: existingError } = await existingQuery.single()

    if (existingError && existingError.code !== 'PGRST116') { // PGRST116 = no rows returned
      return { data: null, error: existingError }
    }

    if (existing) {
      // Update quantity
      const { data, error } = await supabase
        .from('shopping_cart')
        .update({ 
          quantity: existing.quantity + quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single()

      return { data, error }
    } else {
      // Add new item
      const { data, error } = await supabase
        .from('shopping_cart')
        .insert({
          user_id: userId,
          session_id: sessionId,
          product_id: productId,
          product_variant_id: variantId,
          quantity
        })
        .select()
        .single()

      return { data, error }
    }
  }

  // Update cart item quantity
  static async updateCartItemQuantity(cartItemId: string, quantity: number) {
    const supabase = getProductsClient()
    
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      const { error } = await supabase
        .from('shopping_cart')
        .delete()
        .eq('id', cartItemId)

      return { error }
    } else {
      const { data, error } = await supabase
        .from('shopping_cart')
        .update({ 
          quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', cartItemId)
        .select()
        .single()

      return { data, error }
    }
  }

  // Get user cart
  static async getUserCart(userId: string | null, sessionId: string | null) {
    const supabase = getProductsClient()
    let query = supabase
      .from('shopping_cart')
      .select(`
        *,
        products (*)
      `)

    if (userId) {
      query = query.eq('user_id', userId)
    } else {
      query = query.eq('session_id', sessionId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    return { data, error }
  }

  // Clear user cart
  static async clearCart(userId: string | null, sessionId: string | null) {
    const supabase = getProductsClient()
    let query = supabase.from('shopping_cart').delete()

    if (userId) {
      query = query.eq('user_id', userId)
    } else {
      query = query.eq('session_id', sessionId)
    }

    const { error } = await query
    return { error }
  }

  // Add product review
  static async addProductReview(reviewData: {
    product_id: string
    user_id: string
    rating: number
    title?: string
    review_text?: string
    order_item_id?: string
  }) {
    const supabase = getProductsClient()
    const { data, error } = await supabase
      .from('product_reviews')
      .insert({
        ...reviewData,
        is_verified_purchase: !!reviewData.order_item_id
      })
      .select()
      .single()

    return { data, error }
  }

  // Get product reviews
  static async getProductReviews(productId: string, limit = 20, offset = 0) {
    const supabase = getProductsClient()
    const { data, error } = await supabase
      .from('product_reviews')
      .select(`
        *,
        user_id
      `)
      .eq('product_id', productId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    return { data, error }
  }

  // Update inventory (server-side only)
  static async updateInventory(productId: string, variantId: string | null, quantityChange: number, reason: string, userId?: string) {
    const supabase = getProductsServerClient()
    
    if (variantId) {
      // Update variant inventory
      const { data: variant, error: getError } = await supabase
        .from('product_variants')
        .select('inventory_quantity')
        .eq('id', variantId)
        .single()

      if (getError) {
        return { data: null, error: getError }
      }

      const newQuantity = variant.inventory_quantity + quantityChange

      const { data, error } = await supabase
        .from('product_variants')
        .update({ inventory_quantity: newQuantity })
        .eq('id', variantId)
        .select()
        .single()

      // Log inventory movement
      if (!error) {
        await supabase
          .from('inventory_movements')
          .insert({
            product_id: productId,
            product_variant_id: variantId,
            movement_type: quantityChange > 0 ? 'purchase' : 'sale',
            quantity_change: quantityChange,
            quantity_after: newQuantity,
            reason,
            user_id: userId
          })
      }

      return { data, error }
    } else {
      // Update product inventory
      const { data: product, error: getError } = await supabase
        .from('products')
        .select('inventory_quantity')
        .eq('id', productId)
        .single()

      if (getError) {
        return { data: null, error: getError }
      }

      const newQuantity = product.inventory_quantity + quantityChange

      const { data, error } = await supabase
        .from('products')
        .update({ inventory_quantity: newQuantity })
        .eq('id', productId)
        .select()
        .single()

      // Log inventory movement
      if (!error) {
        await supabase
          .from('inventory_movements')
          .insert({
            product_id: productId,
            movement_type: quantityChange > 0 ? 'purchase' : 'sale',
            quantity_change: quantityChange,
            quantity_after: newQuantity,
            reason,
            user_id: userId
          })
      }

      return { data, error }
    }
  }

  // Search products using full-text search
  static async searchProducts(searchTerm: string, limit = 20, offset = 0) {
    const supabase = getProductsClient()
    
    // Get product IDs from search vector
    const { data: searchResults, error: searchError } = await supabase
      .from('product_search')
      .select('product_id')
      .textSearch('search_vector', searchTerm)

    if (searchError) {
      return { data: [], error: searchError }
    }

    if (!searchResults || searchResults.length === 0) {
      return { data: [], error: null }
    }

    const productIds = searchResults.map(r => r.product_id)

    // Get full product details
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (*),
        product_images (*)
      `)
      .in('id', productIds)
      .eq('status', 'active')
      .range(offset, offset + limit - 1)

    return { data, error }
  }
}
