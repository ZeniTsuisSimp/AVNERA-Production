'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowLeft, Package, Mail } from 'lucide-react';
import Header from '@/components/layout/Header';

const CheckoutSuccessPage = () => {
  const searchParams = useSearchParams();
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  useEffect(() => {
    const intent = searchParams.get('payment_intent');
    setPaymentIntentId(intent);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
          <p className="text-gray-600 mb-8">
            Thank you for your order. Your payment has been processed successfully.
          </p>
          
          {paymentIntentId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-8">
              <p className="text-sm text-gray-600">
                <strong>Payment ID:</strong> {paymentIntentId}
              </p>
            </div>
          )}
          
          {/* What Happens Next */}
          <div className="text-left mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">What happens next?</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-0.5">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Order Confirmation</h3>
                  <p className="text-sm text-gray-600">You&apos;ll receive an order confirmation email shortly with your order details.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-0.5">
                  <Package className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Order Processing</h3>
                  <p className="text-sm text-gray-600">We&apos;ll prepare your order and send you tracking information when it ships.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/account/orders"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Your Orders
            </Link>
            <Link 
              href="/products"
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Link>
          </div>
        </div>
        
        {/* Support Information */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@avnera.com" className="text-blue-600 hover:text-blue-700">
              support@avnera.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
};

export default CheckoutSuccessPage;
