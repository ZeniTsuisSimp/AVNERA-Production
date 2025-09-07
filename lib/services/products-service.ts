import { supabaseProducts } from '@/lib/supabase/config';

// Temporarily simplified for deployment
type Product = any;
type CreateProduct = any;
type UpdateProduct = any;
type ProductWithCategory = any;
type Category = any;
type CreateCategory = any;
type UpdateCategory = any;
type ShoppingCartItem = any;
type CreateCartItem = any;
type UpdateCartItem = any;
type CartItemWithProduct = any;
type WishlistItem = any;
type CreateWishlistItem = any;
type WishlistItemWithProduct = any;
type ProductReview = any;
type CreateProductReview = any;
type ProductWithReviews = any;
type ClerkUserId = string;
type UUID = string;
class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}
type QueryOptions = any;

// Helper function to get error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

// =====================================================
// PRODUCTS SERVICE
// =====================================================

export class ProductService {
  /**
   * Get all products with optional filtering and pagination
   */
  static async getProducts(options: QueryOptions = {}): Promise<Product[]> {
    if (!supabaseProducts) {
      throw new Error('Products database not configured');
    }

    try {
      let query = supabaseProducts
        .from('products')
        .select('*')
        .eq('status', 'active');

      // Apply filters
      if (options.filters?.category_id) {
        query = query.eq('category_id', options.filters.category_id);
      }
      if (options.filters?.is_featured) {
        query = query.eq('is_featured', options.filters.is_featured);
      }
      if (options.filters?.min_price) {
        query = query.gte('price', options.filters.min_price);
      }
      if (options.filters?.max_price) {
        query = query.lte('price', options.filters.max_price);
      }

      // Apply sorting
      const sortBy = options.sortBy || 'created_at';
      const sortOrder = options.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  }

  /**
   * Get featured products
   */
  static async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    return await this.getProducts({
      filters: { is_featured: true },
      limit,
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  }

  /**
   * Get products by category
   */
  static async getProductsByCategory(categoryId: UUID, options: QueryOptions = {}): Promise<Product[]> {
    return await this.getProducts({
      ...options,
      filters: { ...options.filters, category_id: categoryId }
    });
  }

  /**
   * Get product by ID
   */
  static async getProductById(productId: UUID): Promise<Product | null> {
    if (!supabaseProducts) {
      console.warn('Products database not configured, returning null');
      return null;
    }

    try {
      const { data, error } = await supabaseProducts
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting product:', error);
      throw new DatabaseError(`Failed to get product: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Get product by slug
   */
  static async getProductBySlug(slug: string): Promise<Product | null> {
    if (!supabaseProducts) {
      throw new Error('Products database not configured');
    }

    try {
      const { data, error } = await supabaseProducts
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'active')
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting product by slug:', error);
      throw new DatabaseError(`Failed to get product by slug: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Get product with category
   */
  static async getProductWithCategory(productId: UUID): Promise<ProductWithCategory | null> {
    if (!supabaseProducts) {
      throw new Error('Products database not configured');
    }

    try {
      const { data, error } = await supabaseProducts
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('id', productId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting product with category:', error);
      throw new DatabaseError(`Failed to get product with category: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Create product
   */
  static async createProduct(productData: CreateProduct): Promise<Product> {
    if (!supabaseProducts) {
      throw new Error('Products database not configured');
    }

    try {
      const { data, error } = await supabaseProducts
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw new DatabaseError(`Failed to create product: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Update product
   */
  static async updateProduct(productId: UUID, updates: any): Promise<Product> {
    if (!supabaseProducts) {
      throw new Error('Products database not configured');
    }

    try {
      const { data, error } = await supabaseProducts
        .from('products')
        .update(updates)
        .eq('id', productId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw new DatabaseError(`Failed to update product: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Update product stock
   */
  static async updateProductStock(productId: UUID, quantity: number): Promise<Product> {
    if (!supabaseProducts) {
      throw new Error('Products database not configured');
    }

    try {
      const { data, error } = await supabaseProducts
        .from('products')
        .update({ stock_quantity: quantity })
        .eq('id', productId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating product stock:', error);
      throw new DatabaseError(`Failed to update product stock: ${error.message}`);
    }
  }

  /**
   * Decrease product stock (for orders)
   */
  static async decreaseProductStock(productId: UUID, quantity: number): Promise<Product> {
    if (!supabaseProducts) {
      throw new Error('Products database not configured');
    }

    try {
      // First get current stock
      const product = await this.getProductById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const newStock = Math.max(0, product.stock_quantity - quantity);
      return await this.updateProductStock(productId, newStock);
    } catch (error) {
      console.error('Error decreasing product stock:', error);
      throw error;
    }
  }

  /**
   * Search products by name
   */
  static async searchProducts(searchTerm: string, options: QueryOptions = {}): Promise<Product[]> {
    if (!supabaseProducts) {
      throw new Error('Products database not configured');
    }

    try {
      let query = supabaseProducts
        .from('products')
        .select('*')
        .eq('status', 'active')
        .ilike('name', `%${searchTerm}%`);

      // Apply sorting
      const sortBy = options.sortBy || 'name';
      const sortOrder = options.sortOrder || 'asc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching products:', error);
      throw new DatabaseError(`Failed to search products: ${error.message}`);
    }
  }
}

// =====================================================
// CATEGORIES SERVICE
// =====================================================

export class CategoryService {
  /**
   * Get all active categories
   */
  static async getCategories(): Promise<Category[]> {
    if (!supabaseProducts) {
      throw new Error('Products database not configured');
    }

    try {
      const { data, error } = await supabaseProducts
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting categories:', error);
      throw new DatabaseError(`Failed to get categories: ${error.message}`);
    }
  }

  /**
   * Get category by ID
   */
  static async getCategoryById(categoryId: UUID): Promise<Category | null> {
    if (!supabaseProducts) {
      throw new Error('Products database not configured');
    }

    try {
      const { data, error } = await supabaseProducts
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting category:', error);
      throw new DatabaseError(`Failed to get category: ${error.message}`);
    }
  }

  /**
   * Get category by slug
   */
  static async getCategoryBySlug(slug: string): Promise<Category | null> {
    if (!supabaseProducts) {
      throw new Error('Products database not configured');
    }

    try {
      const { data, error } = await supabaseProducts
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting category by slug:', error);
      throw new DatabaseError(`Failed to get category by slug: ${error.message}`);
    }
  }

  /**
   * Create category
   */
  static async createCategory(categoryData: CreateCategory): Promise<Category> {
    if (!supabaseProducts) {
      throw new Error('Products database not configured');
    }

    try {
      const { data, error } = await supabaseProducts
        .from('categories')
        .insert(categoryData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw new DatabaseError(`Failed to create category: ${error.message}`);
    }
  }

  /**
   * Update category
   */
  static async updateCategory(categoryId: UUID, updates: UpdateCategory): Promise<Category> {
    if (!supabaseProducts) {
      throw new Error('Products database not configured');
    }

    try {
      const { data, error } = await supabaseProducts
        .from('categories')
        .update(updates)
        .eq('id', categoryId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw new DatabaseError(`Failed to update category: ${error.message}`);
    }
  }
}

// =====================================================
// SHOPPING CART SERVICE
// =====================================================

export class CartService {
  /**
   * Get user's cart items with product details
   */
  static async getCartItems(userId: ClerkUserId): Promise<CartItemWithProduct[]> {
    if (!supabaseProducts) {
      console.warn('Products database not configured, returning empty cart');
      return [];
    }

    try {
      const { data, error } = await supabaseProducts
        .from('shopping_cart')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting cart items:', error);
      throw new DatabaseError(`Failed to get cart items: ${error.message}`);
    }
  }

  /**
   * Add item to cart
   */
  static async addToCart(cartData: CreateCartItem): Promise<ShoppingCartItem> {
    if (!supabaseProducts) {
      throw new Error('Products database not configured');
    }

    try {
      // Check if item already exists in cart
      const existingItem = await this.getCartItem(cartData.user_id!, cartData.product_id);
      
      if (existingItem) {
        // Update quantity instead of creating new item
        const newQuantity = existingItem.quantity + cartData.quantity;
        return await this.updateCartItem(existingItem.id, { quantity: newQuantity });
      }

      const { data, error } = await supabaseProducts
        .from('shopping_cart')
        .insert(cartData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw new DatabaseError(`Failed to add to cart: ${error.message}`);
    }
  }

  /**
   * Update cart item
   */
  static async updateCartItem(cartItemId: UUID, updates: UpdateCartItem): Promise<ShoppingCartItem> {
    if (!supabaseProducts) {
      throw new Error('Products database not configured');
    }

    try {
      const { data, error } = await supabaseProducts
        .from('shopping_cart')
        .update(updates)
        .eq('id', cartItemId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw new DatabaseError(`Failed to update cart item: ${error.message}`);
    }
  }

  /**
   * Remove item from cart
   */
  static async removeFromCart(cartItemId: UUID): Promise<void> {
    if (!supabaseProducts) {
      throw new Error('Products database not configured');
    }

    try {
      const { error } = await supabaseProducts
        .from('shopping_cart')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw new DatabaseError(`Failed to remove from cart: ${error.message}`);
    }
  }

  /**
   * Clear user's cart
   */
  static async clearCart(userId: ClerkUserId): Promise<void> {
    if (!supabaseProducts) {
      throw new Error('Products database not configured');
    }

    try {
      const { error } = await supabaseProducts
        .from('shopping_cart')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw new DatabaseError(`Failed to clear cart: ${error.message}`);
    }
  }

  /**
   * Get specific cart item
   */
  static async getCartItem(userId: ClerkUserId, productId: UUID): Promise<ShoppingCartItem | null> {
    if (!supabaseProducts) {
      throw new Error('Products database not configured');
    }

    try {
      const { data, error } = await supabaseProducts
        .from('shopping_cart')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting cart item:', error);
      throw new DatabaseError(`Failed to get cart item: ${error.message}`);
    }
  }

  /**
   * Get cart total
   */
  static async getCartTotal(userId: ClerkUserId): Promise<{ itemCount: number; totalPrice: number }> {
    try {
      if (!supabaseProducts) {
        console.warn('Products database not configured, returning empty cart totals');
        return { itemCount: 0, totalPrice: 0 };
      }
      
      const cartItems = await this.getCartItems(userId);
      
      const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
      const totalPrice = cartItems.reduce((total, item) => {
        return total + (item.quantity * item.product.price);
      }, 0);

      return { itemCount, totalPrice };
    } catch (error) {
      console.error('Error getting cart total:', error);
      throw error;
    }
  }
}

// =====================================================
// WISHLIST SERVICE
// =====================================================

export class WishlistService {
  /**
   * Get user's wishlist items with product details
   */
  static async getWishlistItems(userId: ClerkUserId): Promise<WishlistItemWithProduct[]> {
    if (!supabaseProducts) {
      throw new Error('Products database not configured');
    }

    try {
      const { data, error } = await supabaseProducts
        .from('wishlists')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting wishlist items:', error);
      throw new DatabaseError(`Failed to get wishlist items: ${error.message}`);
    }
  }

  /**
   * Add item to wishlist
   */
  static async addToWishlist(wishlistData: CreateWishlistItem): Promise<WishlistItem> {
    if (!supabaseProducts) {
      throw new Error('Products database not configured');
    }

    try {
      const { data, error } = await supabaseProducts
        .from('wishlists')
        .insert(wishlistData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw new DatabaseError(`Failed to add to wishlist: ${error.message}`);
    }
  }

  /**
   * Remove item from wishlist
   */
  static async removeFromWishlist(userId: ClerkUserId, productId: UUID): Promise<void> {
    if (!supabaseProducts) {
      throw new Error('Products database not configured');
    }

    try {
      const { error } = await supabaseProducts
        .from('wishlists')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw new DatabaseError(`Failed to remove from wishlist: ${error.message}`);
    }
  }

  /**
   * Check if product is in wishlist
   */
  static async isInWishlist(userId: ClerkUserId, productId: UUID): Promise<boolean> {
    if (!supabaseProducts) {
      throw new Error('Products database not configured');
    }

    try {
      const { data, error } = await supabaseProducts
        .from('wishlists')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (error && error.code === 'PGRST116') return false;
      if (error) throw error;
      
      return !!data;
    } catch (error) {
      console.error('Error checking wishlist:', error);
      return false;
    }
  }
}

// =====================================================
// REVIEWS SERVICE
// =====================================================

export class ReviewService {
  /**
   * Get product reviews
   */
  static async getProductReviews(productId: UUID): Promise<ProductReview[]> {
    if (!supabaseProducts) {
      throw new Error('Products database not configured');
    }

    try {
      const { data, error } = await supabaseProducts
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting product reviews:', error);
      throw new DatabaseError(`Failed to get product reviews: ${error.message}`);
    }
  }

  /**
   * Add product review
   */
  static async addReview(reviewData: CreateProductReview): Promise<ProductReview> {
    if (!supabaseProducts) {
      throw new Error('Products database not configured');
    }

    try {
      const { data, error } = await supabaseProducts
        .from('product_reviews')
        .insert(reviewData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding review:', error);
      throw new DatabaseError(`Failed to add review: ${error.message}`);
    }
  }

  /**
   * Get product with reviews and rating
   */
  static async getProductWithReviews(productId: UUID): Promise<ProductWithReviews | null> {
    try {
      const [product, reviews] = await Promise.all([
        ProductService.getProductById(productId),
        this.getProductReviews(productId)
      ]);

      if (!product) return null;

      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

      return {
        ...product,
        reviews,
        average_rating: Number(averageRating.toFixed(1)),
        review_count: reviews.length
      };
    } catch (error) {
      console.error('Error getting product with reviews:', error);
      throw error;
    }
  }
}

// =====================================================
// COMBINED PRODUCTS SERVICE
// =====================================================

export class ProductsService {
  static product = ProductService;
  static category = CategoryService;
  static cart = CartService;
  static wishlist = WishlistService;
  static review = ReviewService;
}
