export interface Order {
  id: string;
  user_id: string;
  order_number?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  
  // Shipping Information
  shipping_first_name?: string;
  shipping_last_name?: string;
  shipping_company?: string;
  shipping_address_line_1?: string;
  shipping_address_line_2?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_postal_code?: string;
  shipping_country?: string;
  shipping_phone?: string;
  
  // Simple shipping address (for backward compatibility)
  shipping_address?: string;
  
  // Billing Information
  billing_first_name?: string;
  billing_last_name?: string;
  billing_company?: string;
  billing_address_line_1?: string;
  billing_address_line_2?: string;
  billing_city?: string;
  billing_state?: string;
  billing_postal_code?: string;
  billing_country?: string;
  billing_phone?: string;
  
  // Order dates
  order_date?: string;
  confirmed_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  
  // Additional metadata
  notes?: string;
  admin_notes?: string;
  cancellation_reason?: string;
  tracking_number?: string;
  estimated_delivery_date?: string;
  
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_variant_id?: string;
  
  // Product details at time of order
  product_name: string;
  product_sku?: string;
  variant_name?: string;
  variant_sku?: string;
  
  quantity: number;
  unit_price: number;
  total_price: number;
  
  // Product attributes at time of purchase
  size?: string;
  color?: string;
  material?: string;
  
  created_at?: string;
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

export interface CreateOrderRequest {
  shipping_address: string;
  payment_method: string;
  total_amount?: number;
  subtotal?: number;
  tax_amount?: number;
  shipping_amount?: number;
  discount_amount?: number;
  currency?: string;
}
