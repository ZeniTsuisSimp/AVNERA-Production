import { getOrdersClient, getOrdersServerClient, Order, OrderItem } from '@/lib/supabase-multi'

export interface CreateOrderData {
  user_id: string
  items: Array<{
    product_id: string
    product_variant_id?: string
    product_name: string
    quantity: number
    unit_price: number
    size?: string
    color?: string
  }>
  shipping_address: {
    first_name: string
    last_name: string
    address_line_1: string
    address_line_2?: string
    city: string
    state: string
    postal_code: string
    country: string
    phone?: string
  }
  billing_address?: {
    first_name: string
    last_name: string
    address_line_1: string
    address_line_2?: string
    city: string
    state: string
    postal_code: string
    country: string
    phone?: string
  }
  subtotal: number
  tax_amount?: number
  shipping_amount?: number
  discount_amount?: number
  total_amount: number
}

export class OrdersService {
  // Create new order
  static async createOrder(orderData: CreateOrderData) {
    const supabase = getOrdersServerClient()
    
    try {
      // Calculate total price for verification
      const calculatedSubtotal = orderData.items.reduce(
        (sum, item) => sum + (item.unit_price * item.quantity), 
        0
      )
      
      const totalAmount = calculatedSubtotal + 
        (orderData.tax_amount || 0) + 
        (orderData.shipping_amount || 0) - 
        (orderData.discount_amount || 0)

      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: orderData.user_id,
          subtotal: orderData.subtotal,
          tax_amount: orderData.tax_amount || 0,
          shipping_amount: orderData.shipping_amount || 0,
          discount_amount: orderData.discount_amount || 0,
          total_amount: orderData.total_amount,
          
          // Shipping address
          shipping_first_name: orderData.shipping_address.first_name,
          shipping_last_name: orderData.shipping_address.last_name,
          shipping_address_line_1: orderData.shipping_address.address_line_1,
          shipping_address_line_2: orderData.shipping_address.address_line_2,
          shipping_city: orderData.shipping_address.city,
          shipping_state: orderData.shipping_address.state,
          shipping_postal_code: orderData.shipping_address.postal_code,
          shipping_country: orderData.shipping_address.country,
          shipping_phone: orderData.shipping_address.phone,
          
          // Billing address (use shipping if not provided)
          billing_first_name: orderData.billing_address?.first_name || orderData.shipping_address.first_name,
          billing_last_name: orderData.billing_address?.last_name || orderData.shipping_address.last_name,
          billing_address_line_1: orderData.billing_address?.address_line_1 || orderData.shipping_address.address_line_1,
          billing_address_line_2: orderData.billing_address?.address_line_2 || orderData.shipping_address.address_line_2,
          billing_city: orderData.billing_address?.city || orderData.shipping_address.city,
          billing_state: orderData.billing_address?.state || orderData.shipping_address.state,
          billing_postal_code: orderData.billing_address?.postal_code || orderData.shipping_address.postal_code,
          billing_country: orderData.billing_address?.country || orderData.shipping_address.country,
          billing_phone: orderData.billing_address?.phone || orderData.shipping_address.phone,
        })
        .select()
        .single()

      if (orderError) {
        return { data: null, error: orderError }
      }

      // Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_variant_id: item.product_variant_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.unit_price * item.quantity,
        size: item.size,
        color: item.color,
      }))

      const { data: createdItems, error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)
        .select()

      if (itemsError) {
        // Rollback order creation if items creation fails
        await supabase.from('orders').delete().eq('id', order.id)
        return { data: null, error: itemsError }
      }

      return { 
        data: { 
          order, 
          items: createdItems 
        }, 
        error: null 
      }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Get user orders
  static async getUserOrders(userId: string, limit = 20, offset = 0) {
    const supabase = getOrdersClient()
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    return { data, error }
  }

  // Get single order with items
  static async getOrder(orderId: string, userId?: string) {
    const supabase = getOrdersClient()
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (*),
        payments (*),
        shipments (*)
      `)
      .eq('id', orderId)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query.single()
    return { data, error }
  }

  // Update order status
  static async updateOrderStatus(orderId: string, status: string) {
    const supabase = getOrdersServerClient()
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status,
        ...(status === 'confirmed' && { confirmed_at: new Date().toISOString() }),
        ...(status === 'shipped' && { shipped_at: new Date().toISOString() }),
        ...(status === 'delivered' && { delivered_at: new Date().toISOString() }),
        ...(status === 'cancelled' && { cancelled_at: new Date().toISOString() }),
      })
      .eq('id', orderId)
      .select()
      .single()

    return { data, error }
  }

  // Create payment
  static async createPayment(paymentData: {
    order_id: string
    payment_method: string
    amount: number
    currency?: string
    gateway_transaction_id?: string
    gateway_payment_id?: string
    gateway_order_id?: string
    payment_data?: any
  }) {
    const supabase = getOrdersServerClient()
    const { data, error } = await supabase
      .from('payments')
      .insert({
        ...paymentData,
        currency: paymentData.currency || 'INR'
      })
      .select()
      .single()

    return { data, error }
  }

  // Update payment status
  static async updatePaymentStatus(
    paymentId: string, 
    status: string, 
    gatewayData?: any
  ) {
    const supabase = getOrdersServerClient()
    const updateData: any = { 
      payment_status: status,
      ...(gatewayData && { payment_data: gatewayData }),
      ...(status === 'completed' && { payment_date: new Date().toISOString() })
    }

    const { data, error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', paymentId)
      .select()
      .single()

    return { data, error }
  }

  // Apply coupon to order
  static async applyCoupon(orderId: string, couponCode: string, userId: string) {
    const supabase = getOrdersServerClient()
    
    // First check if coupon is valid and available
    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode)
      .eq('is_active', true)
      .single()

    if (couponError || !coupon) {
      return { data: null, error: new Error('Invalid or expired coupon') }
    }

    // Check if user has already used this coupon
    const { data: existingUsage, error: usageError } = await supabase
      .from('coupon_usage')
      .select('*')
      .eq('coupon_id', coupon.id)
      .eq('user_id', userId)

    if (usageError) {
      return { data: null, error: usageError }
    }

    if (existingUsage && existingUsage.length >= (coupon.usage_limit_per_user || 1)) {
      return { data: null, error: new Error('Coupon usage limit exceeded') }
    }

    // Get order details to calculate discount
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return { data: null, error: new Error('Order not found') }
    }

    // Calculate discount amount
    let discountAmount = 0
    if (coupon.discount_type === 'percentage') {
      discountAmount = (order.subtotal * coupon.discount_value) / 100
    } else {
      discountAmount = coupon.discount_value
    }

    // Apply maximum discount limit if set
    if (coupon.maximum_discount_amount && discountAmount > coupon.maximum_discount_amount) {
      discountAmount = coupon.maximum_discount_amount
    }

    // Update order with discount
    const newTotal = order.subtotal + order.tax_amount + order.shipping_amount - discountAmount
    
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        discount_amount: discountAmount,
        total_amount: newTotal
      })
      .eq('id', orderId)
      .select()
      .single()

    if (updateError) {
      return { data: null, error: updateError }
    }

    // Record coupon usage
    const { error: recordError } = await supabase
      .from('coupon_usage')
      .insert({
        coupon_id: coupon.id,
        order_id: orderId,
        user_id: userId,
        discount_amount: discountAmount
      })

    if (recordError) {
      // Rollback order update if usage recording fails
      await supabase
        .from('orders')
        .update({
          discount_amount: order.discount_amount,
          total_amount: order.total_amount
        })
        .eq('id', orderId)
      
      return { data: null, error: recordError }
    }

    return { data: { order: updatedOrder, discountAmount }, error: null }
  }

  // Create return request
  static async createReturn(returnData: {
    order_id: string
    order_item_id: string
    user_id: string
    return_type: 'return' | 'exchange'
    reason: string
    description?: string
    quantity: number
    exchange_product_id?: string
    exchange_variant_id?: string
  }) {
    const supabase = getOrdersServerClient()
    const { data, error } = await supabase
      .from('returns')
      .insert(returnData)
      .select()
      .single()

    return { data, error }
  }

  // Get user returns
  static async getUserReturns(userId: string) {
    const supabase = getOrdersClient()
    const { data, error } = await supabase
      .from('returns')
      .select(`
        *,
        orders (*),
        order_items (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    return { data, error }
  }
}
