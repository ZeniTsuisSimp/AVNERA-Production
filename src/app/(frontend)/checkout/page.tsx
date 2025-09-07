'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag, CreditCard, MapPin, Lock, CheckCircle, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  products: {
    id: string;
    name: string;
    price: number;
    slug: string;
    description: string;
    stock_quantity: number;
  };
}

const CheckoutForm = ({ cartItems, totalAmount }: { cartItems: CartItem[]; totalAmount: number }) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { user } = useUser();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.emailAddresses?.[0]?.emailAddress || '',
    phone: user?.phoneNumbers?.[0]?.phoneNumber || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'IN'
  });

  // Create payment intent on component mount
  useEffect(() => {
    if (cartItems.length > 0 && user) {
      createPaymentIntent();
    }
  }, [cartItems, user]);

  const createPaymentIntent = async () => {
    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartData: {
            items: cartItems.map(item => ({
              productId: item.product_id,
              quantity: item.quantity,
              price: item.products.price
            })),
            total: totalAmount
          },
          shippingAddress
        })
      });

      const result = await response.json();
      if (result.success) {
        setClientSecret(result.clientSecret);
      } else {
        setPaymentError(result.error || 'Failed to create payment intent');
      }
    } catch (error) {
      setPaymentError('Failed to initialize payment');
      console.error('Payment intent error:', error);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setPaymentError('Card element not found');
      setIsProcessing(false);
      return;
    }

    // Confirm payment with Stripe
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
          email: shippingAddress.email,
          phone: shippingAddress.phone,
          address: {
            line1: shippingAddress.addressLine1,
            line2: shippingAddress.addressLine2,
            city: shippingAddress.city,
            state: shippingAddress.state,
            postal_code: shippingAddress.postalCode,
            country: shippingAddress.country,
          }
        }
      }
    });

    if (error) {
      setPaymentError(error.message || 'Payment failed');
      setIsProcessing(false);
    } else if (paymentIntent.status === 'succeeded') {
      // Payment successful - create order and clear cart
      try {
        // Calculate breakdown
        const subtotal = cartItems.reduce((total, item) => total + (item.products.price * item.quantity), 0);
        const shipping = subtotal >= 999 ? 0 : 99;
        const tax = Math.round(subtotal * 0.18);
        
        const orderData = {
          payment_intent_id: paymentIntent.id,
          shipping_address: `${shippingAddress.firstName} ${shippingAddress.lastName}\n${shippingAddress.addressLine1}\n${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}\n${shippingAddress.country}\nPhone: ${shippingAddress.phone}\nEmail: ${shippingAddress.email}`,
          payment_method: 'STRIPE',
          status: 'confirmed', // Set status to confirmed since payment succeeded
          subtotal: subtotal,
          tax_amount: tax,
          shipping_amount: shipping,
          total_amount: totalAmount,
          currency: 'INR'
        };
        
        console.log('Sending order data:', orderData);
        
        const orderResponse = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        });

        if (orderResponse.ok) {
          const orderResult = await orderResponse.json();
          console.log('Order created successfully:', orderResult);
          
          // Clear cart
          await fetch('/api/cart', { method: 'DELETE' });
          
          // Redirect to success page
          router.push(`/checkout/success?payment_intent=${paymentIntent.id}`);
        } else {
          const errorResult = await orderResponse.json();
          console.error('Order creation failed:', errorResult);
          throw new Error(`Failed to create order: ${errorResult.error || 'Unknown error'}`);
        }
      } catch (error) {
        setPaymentError('Payment succeeded but order creation failed. Please contact support.');
      }
    }
    
    setIsProcessing(false);
  };

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Shipping Address */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          Shipping Address
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              required
              value={shippingAddress.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              required
              value={shippingAddress.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={shippingAddress.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              required
              value={shippingAddress.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
            <input
              type="text"
              required
              value={shippingAddress.addressLine1}
              onChange={(e) => handleInputChange('addressLine1', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
            <input
              type="text"
              value={shippingAddress.addressLine2}
              onChange={(e) => handleInputChange('addressLine2', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              required
              value={shippingAddress.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input
              type="text"
              required
              value={shippingAddress.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
            <input
              type="text"
              required
              value={shippingAddress.postalCode}
              onChange={(e) => handleInputChange('postalCode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="country-select" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <select
              id="country-select"
              value={shippingAddress.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="IN">India</option>
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
              <option value="CA">Canada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Payment Details
        </h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Card Information</label>
          <div className="p-3 border border-gray-300 rounded-md">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {paymentError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{paymentError}</p>
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
        <div className="space-y-3">
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span className="text-gray-600">
                {item.products.name} × {item.quantity}
              </span>
              <span className="font-medium">₹{(item.products.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          
          <div className="border-t pt-3 space-y-2">
            {/* Subtotal */}
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{cartItems.reduce((total, item) => total + (item.products.price * item.quantity), 0).toLocaleString()}</span>
            </div>
            
            {/* Shipping */}
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>
                {(cartItems.reduce((total, item) => total + (item.products.price * item.quantity), 0) >= 999) ? (
                  <span className="text-green-600">Free</span>
                ) : (
                  '₹99'
                )}
              </span>
            </div>
            
            {/* Tax */}
            <div className="flex justify-between text-gray-600">
              <span>Tax (GST 18%)</span>
              <span>₹{Math.round(cartItems.reduce((total, item) => total + (item.products.price * item.quantity), 0) * 0.18).toLocaleString()}</span>
            </div>
            
            {/* Total */}
            <div className="flex justify-between text-lg font-semibold border-t pt-2">
              <span>Total</span>
              <span>₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || !clientSecret || isProcessing}
        className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <Lock className="w-4 h-4 mr-2" />
            Pay ₹{totalAmount.toLocaleString()}
          </>
        )}
      </button>
    </form>
  );
};

const CheckoutPage = () => {
  const { user } = useUser();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCartItems();
    }
  }, [user]);

  const fetchCartItems = async () => {
    try {
      const response = await fetch('/api/cart');
      const result = await response.json();
      
      if (result.success) {
        setCartItems(result.data.items || []);
        if ((result.data.items || []).length === 0) {
          router.push('/cart');
        }
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const subtotal = cartItems.reduce((total, item) => total + (item.products.price * item.quantity), 0);
  const shipping = subtotal >= 999 ? 0 : 99;
  const tax = Math.round(subtotal * 0.18); // 18% GST
  const totalAmount = subtotal + shipping + tax;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-900">Loading checkout...</h1>
          </div>
        </main>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-12">
          <div className="text-center">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Add some items to your cart before checking out.</p>
            <Link 
              href="/products"
              className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/cart"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <Elements stripe={stripePromise}>
          <CheckoutForm cartItems={cartItems} totalAmount={totalAmount} />
        </Elements>
      </main>
    </div>
  );
};

export default CheckoutPage;
