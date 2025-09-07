import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables')
}

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20', // Use latest API version
  typescript: true,
})

// Convert rupees to paise (Stripe expects amounts in smallest currency unit)
export const rupeesToPaise = (rupees: number): number => {
  return Math.round(rupees * 100)
}

// Convert paise to rupees
export const paiseToRupees = (paise: number): number => {
  return paise / 100
}

export interface CreatePaymentIntentParams {
  amount: number // Amount in paise
  currency: string
  description?: string
  receipt_email?: string
  metadata?: Record<string, string>
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

export interface PaymentIntentResult {
  success: boolean
  clientSecret?: string
  paymentIntent?: Stripe.PaymentIntent
  error?: string
}

// Create a payment intent with Stripe
export const createStripePaymentIntent = async (
  params: CreatePaymentIntentParams
): Promise<PaymentIntentResult> => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: params.amount,
      currency: params.currency,
      description: params.description,
      receipt_email: params.receipt_email,
      metadata: params.metadata || {},
      shipping: params.shipping,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return {
      success: true,
      clientSecret: paymentIntent.client_secret || undefined,
      paymentIntent,
    }
  } catch (error) {
    console.error('Stripe payment intent creation failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

// Retrieve a payment intent
export const retrievePaymentIntent = async (
  paymentIntentId: string
): Promise<PaymentIntentResult> => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    return {
      success: true,
      paymentIntent,
    }
  } catch (error) {
    console.error('Stripe payment intent retrieval failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

// Cancel a payment intent
export const cancelPaymentIntent = async (
  paymentIntentId: string
): Promise<PaymentIntentResult> => {
  try {
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId)

    return {
      success: true,
      paymentIntent,
    }
  } catch (error) {
    console.error('Stripe payment intent cancellation failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

// Verify webhook signature (for webhook endpoints)
export const verifyWebhookSignature = (
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event | null => {
  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return null
  }
}

export default stripe
