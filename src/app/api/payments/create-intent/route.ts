import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createStripePaymentIntent, rupeesToPaise as stripeRupeesToPaise } from '@/lib/payments/stripe'
import { supabaseOrders } from '@/lib/supabase/config'

interface CreatePaymentIntentRequest {
  orderId?: string;
  cartData?: {
    items: Array<{
      productId: string;
      variantId?: string;
      quantity: number;
      price: number;
    }>;
    total: number;
    couponCode?: string;
  };
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

// POST /api/payments/create-intent
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData: CreatePaymentIntentRequest = body
    
    // Basic validation
    
    if (!validatedData.shippingAddress || !validatedData.shippingAddress.email) {
      return NextResponse.json(
        { error: 'Missing shipping address information' },
        { status: 400 }
      )
    }

    let orderAmount = 0
    let orderDescription = ''

    if (validatedData.orderId && supabaseOrders) {
      const { data: order, error } = await supabaseOrders
        .from('orders')
        .select('*')
        .eq('id', validatedData.orderId)
        .eq('user_id', user.id)
        .eq('status', 'PENDING')
        .single()

      if (error || !order) {
        return NextResponse.json(
          { error: 'Order not found or not in pending status' },
          { status: 404 }
        )
      }

      orderAmount = order.total_amount
      orderDescription = `Payment for Order #${order.order_number}`
    } else if (validatedData.cartData) {
      orderAmount = validatedData.cartData.total
      orderDescription = 'Payment for cart items'
    } else {
      return NextResponse.json(
        { error: 'Either orderId or cartData is required' },
        { status: 400 }
      )
    }

    const shippingCost = orderAmount >= 999 ? 0 : 99
    const totalAmount = orderAmount + shippingCost

    const receiptId = `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Use Stripe for payment processing
    const stripeResult = await createStripePaymentIntent({
      amount: stripeRupeesToPaise(totalAmount),
      currency: 'inr',
      description: orderDescription,
      receipt_email: validatedData.shippingAddress.email,
      metadata: {
        userId: user.id,
        orderId: validatedData.orderId || '',
        receiptId,
      },
      shipping: {
        name: `${validatedData.shippingAddress.firstName} ${validatedData.shippingAddress.lastName}`,
        address: {
          line1: validatedData.shippingAddress.addressLine1,
          line2: validatedData.shippingAddress.addressLine2 || undefined,
          city: validatedData.shippingAddress.city,
          state: validatedData.shippingAddress.state,
          postal_code: validatedData.shippingAddress.postalCode,
          country: validatedData.shippingAddress.country.toLowerCase(),
        }
      }
    })

    if (!stripeResult.success) {
      return NextResponse.json(
        { error: stripeResult.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      paymentMethod: 'STRIPE',
      clientSecret: stripeResult.clientSecret,
      paymentIntentId: stripeResult.paymentIntent?.id,
      amount: totalAmount,
      currency: 'INR',
      orderDescription,
    })

  } catch (error) {
    console.error('Payment intent creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
