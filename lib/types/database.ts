// =====================================================
// DATABASE TYPES FOR MULTI-DATABASE ARCHITECTURE
// =====================================================

// Base types
export type UUID = string;
export type ClerkUserId = string;
export type Timestamp = string;

// =====================================================
// USER DATABASE TYPES
// =====================================================

export interface UserProfile {
  id: ClerkUserId;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface UserAddress {
  id: UUID;
  user_id: ClerkUserId;
  first_name: string;
  last_name: string;
  address_line_1: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
  created_at: Timestamp;
}

// Create types (without generated fields)
export type CreateUserProfile = Omit<UserProfile, 'created_at' | 'updated_at'>;
export type UpdateUserProfile = Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>;

export type CreateUserAddress = Omit<UserAddress, 'id' | 'created_at'>;
export type UpdateUserAddress = Partial<Omit<UserAddress, 'id' | 'user_id' | 'created_at'>>;

// =====================================================
// ORDERS DATABASE TYPES
// =====================================================

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed';
export type PaymentMethod = 'razorpay' | 'stripe' | 'cod';

export interface Order {
  id: UUID;
  user_id: ClerkUserId;
  order_number: string;
  status: OrderStatus;
  total_amount: number;
  currency: string;
  shipping_address: string;
  shipping_phone?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface OrderItem {
  id: UUID;
  order_id: UUID;
  product_id: UUID;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: Timestamp;
}

export interface Payment {
  id: UUID;
  order_id: UUID;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  amount: number;
  currency: string;
  gateway_transaction_id?: string;
  created_at: Timestamp;
}

// Create types
export type CreateOrder = Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>;
export type UpdateOrder = Partial<Omit<Order, 'id' | 'user_id' | 'order_number' | 'created_at' | 'updated_at'>>;

export type CreateOrderItem = Omit<OrderItem, 'id' | 'created_at'>;
export type CreatePayment = Omit<Payment, 'id' | 'created_at'>;

// Order with related data
export interface OrderWithItems extends Order {
  items: OrderItem[];
  payment?: Payment;
}

// =====================================================
// PRODUCTS DATABASE TYPES
// =====================================================

export type ProductStatus = 'active' | 'inactive';

export interface Category {
  id: UUID;
  name: string;
  slug: string;
  parent_id?: UUID;
  is_active: boolean;
  created_at: Timestamp;
}

export interface Product {
  id: UUID;
  name: string;
  slug: string;
  description?: string;
  price: number;
  category_id?: UUID;
  image_url?: string;
  stock_quantity: number;
  status: ProductStatus;
  is_featured: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface ShoppingCartItem {
  id: UUID;
  user_id?: ClerkUserId;
  session_id?: string;
  product_id: UUID;
  quantity: number;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface WishlistItem {
  id: UUID;
  user_id: ClerkUserId;
  product_id: UUID;
  created_at: Timestamp;
}

export interface ProductReview {
  id: UUID;
  product_id: UUID;
  user_id: ClerkUserId;
  rating: number; // 1-5
  review_text?: string;
  is_approved: boolean;
  created_at: Timestamp;
}

// Create types
export type CreateCategory = Omit<Category, 'id' | 'created_at'>;
export type UpdateCategory = Partial<Omit<Category, 'id' | 'created_at'>>;

export type CreateProduct = Omit<Product, 'id' | 'created_at' | 'updated_at'>;
export type UpdateProduct = Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>;

export type CreateCartItem = Omit<ShoppingCartItem, 'id' | 'created_at' | 'updated_at'>;
export type UpdateCartItem = Partial<Omit<ShoppingCartItem, 'id' | 'user_id' | 'session_id' | 'product_id' | 'created_at' | 'updated_at'>>;

export type CreateWishlistItem = Omit<WishlistItem, 'id' | 'created_at'>;
export type CreateProductReview = Omit<ProductReview, 'id' | 'is_approved' | 'created_at'>;

// Product with related data
export interface ProductWithCategory extends Product {
  category?: Category;
}

export interface ProductWithReviews extends Product {
  reviews: ProductReview[];
  average_rating?: number;
  review_count?: number;
}

export interface CartItemWithProduct extends ShoppingCartItem {
  product: Product;
}

export interface WishlistItemWithProduct extends WishlistItem {
  product: Product;
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// =====================================================
// DATABASE CLIENT TYPES
// =====================================================

export type DatabaseType = 'user' | 'orders' | 'products';

export interface DatabaseError extends Error {
  code?: string;
  details?: string;
  hint?: string;
}

// =====================================================
// UTILITY TYPES
// =====================================================

export type Pagination = {
  page?: number;
  limit?: number;
  offset?: number;
};

export type SortOrder = 'asc' | 'desc';

export interface QueryOptions extends Pagination {
  sortBy?: string;
  sortOrder?: SortOrder;
  filters?: Record<string, unknown>;
}

// =====================================================
// FORM TYPES (for frontend)
// =====================================================

export interface CheckoutForm {
  shipping_address: {
    first_name: string;
    last_name: string;
    address_line_1: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone?: string;
  };
  payment_method: PaymentMethod;
}

export interface ProductForm {
  name: string;
  slug: string;
  description?: string;
  price: number;
  category_id?: UUID;
  image_url?: string;
  stock_quantity: number;
  status: ProductStatus;
  is_featured: boolean;
}

export interface ReviewForm {
  rating: number;
  review_text?: string;
}
