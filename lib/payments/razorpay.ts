// Temporarily commented out for deployment - install 'razorpay' package if needed
// import Razorpay from 'razorpay'
import crypto from 'crypto'

// if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
//   throw new Error('Razorpay API keys are not configured')
// }

// export const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// })

export interface RazorpayOrderData {
  amount: number // Amount in paise
  currency: string
  receipt: string
  notes?: Record<string, string>
}

export interface RazorpayPaymentVerification {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

/**
 * Create a Razorpay order
 */
export async function createRazorpayOrder(orderData: RazorpayOrderData) {
  // Temporarily disabled - install 'razorpay' package and uncomment code above
  console.log('Razorpay order creation disabled:', orderData);
  return {
    success: false,
    error: 'Razorpay not configured',
  }
}

/**
 * Verify Razorpay payment signature
 */
export function verifyRazorpayPayment(verification: RazorpayPaymentVerification): boolean {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = verification

    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex')

    return expectedSignature === razorpay_signature
  } catch (error) {
    console.error('Razorpay signature verification failed:', error)
    return false
  }
}

/**
 * Fetch payment details from Razorpay
 */
export async function getRazorpayPayment(paymentId: string) {
  // Temporarily disabled - install 'razorpay' package and uncomment code above
  console.log('Razorpay payment fetch disabled:', paymentId);
  return {
    success: false,
    error: 'Razorpay not configured',
  }
}

/**
 * Refund a Razorpay payment
 */
export async function refundRazorpayPayment(
  paymentId: string,
  amount?: number,
  notes?: Record<string, string>
) {
  // Temporarily disabled - install 'razorpay' package and uncomment code above
  console.log('Razorpay refund disabled:', { paymentId, amount, notes });
  return {
    success: false,
    error: 'Razorpay not configured',
  }
}

/**
 * Convert rupees to paise for Razorpay
 */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100)
}

/**
 * Convert paise to rupees from Razorpay
 */
export function paiseToRupees(paise: number): number {
  return paise / 100
}
