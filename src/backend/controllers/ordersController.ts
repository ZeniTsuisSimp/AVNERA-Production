import { NextRequest } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getOrdersServerClient } from '@/lib/supabase-multi';
import type { ApiResponse } from '@/lib/types/database';

export class OrdersController {
  /**
   * Get user's orders with pagination and filtering
   */
  static async getUserOrders(request: NextRequest): Promise<{ success: boolean; data?: any; error?: string; pagination?: any }> {
    try {
      const user = await currentUser();
      
      if (!user) {
        return { success: false, error: 'Unauthorized' };
      }
      
      const supabaseOrders = getOrdersServerClient();
      if (!supabaseOrders) {
        return { success: false, error: 'Orders database not configured' };
      }
      
      const userId = user.id;
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      const status = searchParams.get('status');

      const options = {
        page,
        limit,
        offset: (page - 1) * limit,
        filters: status ? { status } : undefined,
        sortBy: 'created_at',
        sortOrder: 'desc' as const
      };

      // Fetch user's orders from database
      let query = supabaseOrders
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            product_id,
            product_name,
            quantity,
            unit_price,
            total_price
          )
        `)
        .eq('user_id', userId);

      // Apply status filter if provided
      if (status) {
        query = query.eq('status', status);
      }

      const { data: orders, error: ordersError } = await query
        .order(options.sortBy, { ascending: options.sortOrder === 'asc' })
        .range(options.offset, options.offset + options.limit - 1);

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        return { success: false, error: 'Failed to fetch orders' };
      }

      // Get total count for pagination
      let countQuery = supabaseOrders
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (status) {
        countQuery = countQuery.eq('status', status);
      }

      const { count: totalCount } = await countQuery;
      const totalOrders = totalCount || 0;

      return {
        success: true,
        data: orders || [],
        pagination: {
          page,
          limit,
          total: totalOrders,
          totalPages: Math.ceil(totalOrders / limit)
        }
      };

    } catch (error) {
      console.error('Error getting orders:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Create a new order
   */
  static async createOrder(request: NextRequest): Promise<{ success: boolean; data?: any; error?: string; message?: string }> {
    try {
      const user = await currentUser();
      
      if (!user) {
        return { success: false, error: 'Unauthorized' };
      }
      
      const userId = user.id;
      const checkoutData = await request.json();

      // Validate required fields
      if (!checkoutData.shipping_address || !checkoutData.payment_method) {
        return { success: false, error: 'Missing required fields' };
      }

      const supabaseOrders = getOrdersServerClient();
      if (!supabaseOrders) {
        return { success: false, error: 'Orders database not configured' };
      }

      // Get user's cart items (from products database)
      const { supabaseProducts } = await import('@/lib/supabase/config');
      if (!supabaseProducts) {
        return { success: false, error: 'Products database not configured' };
      }
      
      const { data: cartItems, error: cartError } = await supabaseProducts
        .from('shopping_cart')
        .select(`
          *,
          products(*)
        `)
        .eq('user_id', userId);
      
      if (!cartItems || cartItems.length === 0) {
        return { success: false, error: 'Cart is empty' };
      }

      // Check stock availability for all items
      for (const cartItem of cartItems) {
        if (cartItem.products.stock_quantity < cartItem.quantity) {
          return { success: false, error: `Insufficient stock for ${cartItem.products.name}` };
        }
      }

      // Calculate totals
      const subtotal = checkoutData.subtotal || cartItems.reduce((total, item) => {
        return total + (item.quantity * item.products.price);
      }, 0);
      
      const totalAmount = checkoutData.total_amount || subtotal;
      const taxAmount = checkoutData.tax_amount || 0;
      const shippingAmount = checkoutData.shipping_amount || 0;

      // Generate order number
      const orderDate = new Date();
      const dateStr = orderDate.toISOString().split('T')[0].replace(/-/g, '');
      const orderNumber = `AVN-${dateStr.substring(0, 8)}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`;
      
      // Prepare order data with explicit timestamp
      const now = new Date().toISOString();
      console.log('Creating order with timestamp:', now);
      console.log('Generated order number:', orderNumber);
      console.log('Payment data received:', {
        payment_method: checkoutData.payment_method,
        payment_intent_id: checkoutData.payment_intent_id,
        status: checkoutData.status
      });
      
      const orderData = {
        user_id: userId,
        order_number: orderNumber,
        status: checkoutData.status || (checkoutData.payment_method === 'cod' ? 'confirmed' : 'pending'),
        total_amount: totalAmount,
        subtotal: subtotal,
        tax_amount: taxAmount,
        shipping_amount: shippingAmount,
        discount_amount: checkoutData.discount_amount || 0,
        currency: checkoutData.currency || 'INR',
        shipping_address: checkoutData.shipping_address,
        payment_method: checkoutData.payment_method || 'STRIPE',
        payment_intent_id: checkoutData.payment_intent_id || null,
        payment_status: checkoutData.status === 'confirmed' ? 'completed' : 'pending',
        created_at: now,
        updated_at: now
      };

      // Log the data we're trying to insert for debugging
      console.log('Order data to insert:', JSON.stringify(orderData, null, 2));
      
      // Create order
      const { data: order, error: orderError } = await supabaseOrders
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error details:', {
          message: orderError.message,
          code: orderError.code,
          details: orderError.details,
          hint: orderError.hint
        });
        throw new Error(`Failed to create order: ${orderError.message}`);
      }
      
      console.log('Order created successfully:', JSON.stringify(order, null, 2));

      // Create order items
      const orderItems = cartItems.map(cartItem => ({
        order_id: order.id,
        product_id: cartItem.product_id,
        product_name: cartItem.products.name,
        quantity: cartItem.quantity,
        unit_price: cartItem.products.price,
        total_price: cartItem.quantity * cartItem.products.price
      }));

      const { error: itemsError } = await supabaseOrders
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        // Rollback order creation if items creation fails
        await supabaseOrders.from('orders').delete().eq('id', order.id);
        throw new Error(`Failed to create order items: ${itemsError.message}`);
      }

      // Update stock quantities for purchased items
      for (const cartItem of cartItems) {
        const newStockQuantity = cartItem.products.stock_quantity - cartItem.quantity;
        await supabaseProducts
          .from('products')
          .update({ stock_quantity: newStockQuantity })
          .eq('id', cartItem.product_id);
        
        console.log(`Updated stock for ${cartItem.products.name}: ${cartItem.products.stock_quantity} -> ${newStockQuantity}`);
      }

      // Clear user's cart
      await supabaseProducts
        .from('shopping_cart')
        .delete()
        .eq('user_id', userId);

      return {
        success: true,
        data: order,
        message: 'Order created successfully'
      };

    } catch (error) {
      console.error('Error creating order:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      };
    }
  }
}
