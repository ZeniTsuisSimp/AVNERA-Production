import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Stripe secret key is not configured')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
})

export interface StripePaymentIntentData {
  amount: number // Amount in smallest currency unit (cents for USD, paise for INR)
  currency: string
  metadata?: Record<string, string>
  description?: string
  receipt_email?: string
  shipping?: {
    name: string
    address: {
      line1: string
      line2?: string
      city: string
      state: string
      postal_code: string
      country: string
    }
  }
}

/**
 * Create a Stripe Payment Intent
 */
export async function createStripePaymentIntent(paymentData: StripePaymentIntentData) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: paymentData.amount,
      currency: paymentData.currency,
      metadata: paymentData.metadata || {},
      description: paymentData.description,
      receipt_email: paymentData.receipt_email,
      shipping: paymentData.shipping,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return {
      success: true,
      paymentIntent,
      clientSecret: paymentIntent.client_secret,
    }
  } catch (error) {
    console.error('Stripe PaymentIntent creation failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment intent',
    }
  }
}

/**
 * Retrieve a Stripe Payment Intent
 */
export async function getStripePaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    
    return {
      success: true,
      paymentIntent,
    }
  } catch (error) {
    console.error('Failed to retrieve Stripe PaymentIntent:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve payment intent',
    }
  }
}

/**
 * Create a Stripe refund
 */
export async function createStripeRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer',
  metadata?: Record<string, string>
) {
  try {
    const refundData: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
    }

    if (amount) {
      refundData.amount = amount
    }

    if (reason) {
      refundData.reason = reason
    }

    if (metadata) {
      refundData.metadata = metadata
    }

    const refund = await stripe.refunds.create(refundData)
    
    return {
      success: true,
      refund,
    }
  } catch (error) {
    console.error('Stripe refund failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process refund',
    }
  }
}

/**
 * Convert rupees to paise for Stripe (INR)
 */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100)
}

/**
 * Convert paise to rupees from Stripe (INR)
 */
export function paiseToRupees(paise: number): number {
  return paise / 100
}

/**
 * Construct webhook event from Stripe
 */
export function constructStripeWebhookEvent(
  body: string | Buffer,
  signature: string,
  endpointSecret: string
) {
  try {
    const event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
    return {
      success: true,
      event,
    }
  } catch (error) {
    console.error('Stripe webhook signature verification failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Webhook signature verification failed',
    }
  }
}
