import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getOrdersClient } from '@/lib/supabase-multi';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User must be logged in'
      }, { status: 401 });
    }

    const userId = user.id;
    const ordersClient = getOrdersClient();

    // Sample order data
    const orderData = {
      user_id: userId,
      status: 'pending',
      total_amount: 2999,
      subtotal: 2999,
      tax_amount: 539, // 18% GST
      shipping_amount: 0,
      discount_amount: 0,
      currency: 'INR',
      shipping_address: `${user.firstName} ${user.lastName}
123 Test Street
Mumbai, Maharashtra 400001
India
Phone: +91 9876543210
Email: ${user.emailAddresses?.[0]?.emailAddress}`
    };

    // Create order
    const { data: order, error: orderError } = await ordersClient
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    // Get a real product from the products database
    const { getProductsClient } = await import('@/lib/supabase-multi');
    const productsClient = getProductsClient();
    
    const { data: products } = await productsClient
      .from('products')
      .select('id, name, price')
      .eq('status', 'active')
      .limit(1);
    
    if (!products || products.length === 0) {
      throw new Error('No products found to create order item');
    }
    
    const product = products[0];
    
    // Create sample order item with real product
    const orderItem = {
      order_id: order.id,
      product_id: product.id,
      product_name: product.name,
      quantity: 1,
      unit_price: product.price,
      total_price: product.price
    };

    const { error: itemError } = await ordersClient
      .from('order_items')
      .insert(orderItem);

    if (itemError) {
      // Rollback order creation
      await ordersClient.from('orders').delete().eq('id', order.id);
      throw new Error(`Failed to create order items: ${itemError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Test order created successfully',
      data: {
        order_id: order.id,
        order_number: order.order_number,
        total_amount: order.total_amount,
        status: order.status
      }
    });

  } catch (error) {
    console.error('Error creating test order:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
