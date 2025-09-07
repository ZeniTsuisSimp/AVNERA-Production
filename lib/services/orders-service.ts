import { supabaseOrders } from '@/lib/supabase/config';
import {
  Order,
  CreateOrder,
  UpdateOrder,
  OrderItem,
  CreateOrderItem,
  Payment,
  CreatePayment,
  OrderWithItems,
  ClerkUserId,
  UUID,
  OrderStatus,
  PaymentStatus,
  QueryOptions
} from '../types/database';

// Keep DatabaseError local to this file
class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Helper function to get error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

// =====================================================
// ORDERS SERVICE
// =====================================================

export class OrderService {
  /**
   * Get order by ID with items and payment
   */
  static async getOrderById(orderId: UUID): Promise<OrderWithItems | null> {
    if (!supabaseOrders) {
      throw new Error('Orders database not configured');
    }

    try {
      // Get order
      const { data: order, error: orderError } = await supabaseOrders
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) {
        if (orderError.code === 'PGRST116') return null;
        throw orderError;
      }

      // Get order items
      const { data: items, error: itemsError } = await supabaseOrders
        .from('order_items')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (itemsError) throw itemsError;

      // Get payment
      const { data: payment, error: paymentError } = await supabaseOrders
        .from('payments')
        .select('*')
        .eq('order_id', orderId)
        .single();

      // Payment might not exist yet, so ignore PGRST116 error
      if (paymentError && paymentError.code !== 'PGRST116') {
        throw paymentError;
      }

      return {
        ...order,
        items: items || [],
        payment: payment || undefined
      };
    } catch (error) {
      console.error('Error getting order:', error);
      throw new DatabaseError(`Failed to get order: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Get order by order number
   */
  static async getOrderByNumber(orderNumber: string): Promise<OrderWithItems | null> {
    if (!supabaseOrders) {
      throw new Error('Orders database not configured');
    }

    try {
      const { data: order, error } = await supabaseOrders
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return await this.getOrderById(order.id);
    } catch (error) {
      console.error('Error getting order by number:', error);
      throw new DatabaseError(`Failed to get order by number: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Get all orders for a user
   */
  static async getUserOrders(
    userId: ClerkUserId, 
    options: QueryOptions = {}
  ): Promise<Order[]> {
    if (!supabaseOrders) {
      throw new Error('Orders database not configured');
    }

    try {
      let query = supabaseOrders
        .from('orders')
        .select('*')
        .eq('user_id', userId);

      // Apply filters
      if (options.filters?.status) {
        query = query.eq('status', options.filters.status);
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
      console.error('Error getting user orders:', error);
      throw new DatabaseError(`Failed to get user orders: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Create new order
   */
  static async createOrder(orderData: CreateOrder): Promise<Order> {
    if (!supabaseOrders) {
      throw new Error('Orders database not configured');
    }

    try {
      const { data, error } = await supabaseOrders
        .from('orders')
        .insert(orderData as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new DatabaseError(`Failed to create order: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(
    orderId: UUID, 
    status: OrderStatus
  ): Promise<Order> {
    if (!supabaseOrders) {
      throw new Error('Orders database not configured');
    }

    try {
      const { data, error } = await supabaseOrders
        .from('orders')
        .update({ status } as any)
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new DatabaseError(`Failed to update order status: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Update order
   */
  static async updateOrder(
    orderId: UUID, 
    updates: UpdateOrder
  ): Promise<Order> {
    if (!supabaseOrders) {
      throw new Error('Orders database not configured');
    }

    try {
      const { data, error } = await supabaseOrders
        .from('orders')
        .update(updates as any)
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating order:', error);
      throw new DatabaseError(`Failed to update order: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Cancel order
   */
  static async cancelOrder(orderId: UUID): Promise<Order> {
    return await this.updateOrderStatus(orderId, 'cancelled');
  }
}

// =====================================================
// ORDER ITEMS SERVICE
// =====================================================

export class OrderItemService {
  /**
   * Get order items by order ID
   */
  static async getOrderItems(orderId: UUID): Promise<OrderItem[]> {
    if (!supabaseOrders) {
      throw new Error('Orders database not configured');
    }

    try {
      const { data, error } = await supabaseOrders
        .from('order_items')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting order items:', error);
      throw new DatabaseError(`Failed to get order items: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Add items to order
   */
  static async addOrderItems(items: CreateOrderItem[]): Promise<OrderItem[]> {
    if (!supabaseOrders) {
      throw new Error('Orders database not configured');
    }

    try {
      const { data, error } = await supabaseOrders
        .from('order_items')
        .insert(items as any)
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error adding order items:', error);
      throw new DatabaseError(`Failed to add order items: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Update order item quantity
   */
  static async updateOrderItem(
    itemId: UUID,
    quantity: number,
    unitPrice: number
  ): Promise<OrderItem> {
    if (!supabaseOrders) {
      throw new Error('Orders database not configured');
    }

    try {
      const totalPrice = quantity * unitPrice;
      
      const { data, error } = await supabaseOrders
        .from('order_items')
        .update({ 
          quantity, 
          unit_price: unitPrice,
          total_price: totalPrice 
        })
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating order item:', error);
      throw new DatabaseError(`Failed to update order item: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Remove order item
   */
  static async removeOrderItem(itemId: UUID): Promise<void> {
    if (!supabaseOrders) {
      throw new Error('Orders database not configured');
    }

    try {
      const { error } = await supabaseOrders
        .from('order_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing order item:', error);
      throw new DatabaseError(`Failed to remove order item: ${getErrorMessage(error)}`);
    }
  }
}

// =====================================================
// PAYMENTS SERVICE
// =====================================================

export class PaymentService {
  /**
   * Get payment by order ID
   */
  static async getPaymentByOrderId(orderId: UUID): Promise<Payment | null> {
    if (!supabaseOrders) {
      throw new Error('Orders database not configured');
    }

    try {
      const { data, error } = await supabaseOrders
        .from('payments')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting payment:', error);
      throw new DatabaseError(`Failed to get payment: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Create payment record
   */
  static async createPayment(paymentData: CreatePayment): Promise<Payment> {
    if (!supabaseOrders) {
      throw new Error('Orders database not configured');
    }

    try {
      const { data, error } = await supabaseOrders
        .from('payments')
        .insert(paymentData as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw new DatabaseError(`Failed to create payment: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Update payment status
   */
  static async updatePaymentStatus(
    paymentId: UUID,
    status: PaymentStatus,
    gatewayTransactionId?: string
  ): Promise<Payment> {
    if (!supabaseOrders) {
      throw new Error('Orders database not configured');
    }

    try {
      const updates: { payment_status: PaymentStatus; gateway_transaction_id?: string } = { payment_status: status };
      if (gatewayTransactionId) {
        updates.gateway_transaction_id = gatewayTransactionId;
      }

      const { data, error } = await supabaseOrders
        .from('payments')
        .update(updates as any)
        .eq('id', paymentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw new DatabaseError(`Failed to update payment status: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Get payment by gateway transaction ID
   */
  static async getPaymentByTransactionId(transactionId: string): Promise<Payment | null> {
    if (!supabaseOrders) {
      throw new Error('Orders database not configured');
    }

    try {
      const { data, error } = await supabaseOrders
        .from('payments')
        .select('*')
        .eq('gateway_transaction_id', transactionId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting payment by transaction ID:', error);
      throw new DatabaseError(`Failed to get payment by transaction ID: ${getErrorMessage(error)}`);
    }
  }
}

// =====================================================
// COMBINED ORDERS SERVICE
// =====================================================

export class OrdersService {
  static order = OrderService;
  static item = OrderItemService;
  static payment = PaymentService;

  /**
   * Create complete order with items and payment
   */
  static async createCompleteOrder(orderData: {
    order: CreateOrder;
    items: Omit<CreateOrderItem, 'order_id'>[];
    payment: Omit<CreatePayment, 'order_id'>;
  }): Promise<OrderWithItems> {
    try {
      // Create order first
      const order = await OrderService.createOrder(orderData.order);

      // Add order_id to items and payment
      const itemsWithOrderId = orderData.items.map(item => ({
        ...item,
        order_id: order.id
      }));

      const paymentWithOrderId = {
        ...orderData.payment,
        order_id: order.id
      };

      // Create items and payment
      const [items, payment] = await Promise.all([
        OrderItemService.addOrderItems(itemsWithOrderId),
        PaymentService.createPayment(paymentWithOrderId)
      ]);

      return {
        ...order,
        items,
        payment
      };
    } catch (error) {
      console.error('Error creating complete order:', error);
      throw error;
    }
  }

  /**
   * Calculate order total from items
   */
  static calculateOrderTotal(items: { quantity: number; unit_price: number }[]): number {
    return items.reduce((total, item) => {
      return total + (item.quantity * item.unit_price);
    }, 0);
  }

  /**
   * Get order summary for user
   */
  static async getOrderSummary(userId: ClerkUserId): Promise<{
    total_orders: number;
    pending_orders: number;
    completed_orders: number;
    total_spent: number;
  }> {
    if (!supabaseOrders) {
      throw new Error('Orders database not configured');
    }

    try {
      const { data, error } = await supabaseOrders
        .from('orders')
        .select('status, total_amount')
        .eq('user_id', userId);

      if (error) throw error;

      const orders = data || [];
      const summary = {
        total_orders: orders.length,
        pending_orders: orders.filter((o: any) => ['pending', 'confirmed'].includes(o.status)).length,
        completed_orders: orders.filter((o: any) => o.status === 'delivered').length,
        total_spent: orders
          .filter((o: any) => o.status !== 'cancelled')
          .reduce((sum: number, o: any) => sum + o.total_amount, 0)
      };

      return summary;
    } catch (error) {
      console.error('Error getting order summary:', error);
      throw error;
    }
  }
}
