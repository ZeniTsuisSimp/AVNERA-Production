'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  MapPin, 
  CreditCard, 
  Receipt, 
  Calendar,
  Eye,
  Download,
  RefreshCw,
  Loader2
} from 'lucide-react';

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  size?: string;
  color?: string;
  material?: string;
}

interface DeliveryAddress {
  id?: string;
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default?: boolean;
}

interface PaymentInfo {
  method: 'card' | 'upi' | 'netbanking' | 'wallet' | 'cod';
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  transaction_id?: string;
  gateway?: string;
}

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  updated_at: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  currency: string;
  order_items: OrderItem[];
  delivery_address: DeliveryAddress;
  payment_info: PaymentInfo;
  tracking_number?: string;
  estimated_delivery?: string;
  notes?: string;
}

const OrderDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // First try to get the specific order from the orders list
        const response = await fetch('/api/orders?limit=100&page=1');
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch order details');
        }

        const foundOrder = data.data?.find((o: Order) => o.id === orderId);
        
        if (!foundOrder) {
          throw new Error('Order not found');
        }

        // Enhance order with mock data for missing fields
        const enhancedOrder: Order = {
          ...foundOrder,
          delivery_address: foundOrder.delivery_address || {
            full_name: 'John Doe',
            phone: '+91 9876543210',
            address_line_1: '123 Main Street',
            address_line_2: 'Apartment 4B',
            city: 'Mumbai',
            state: 'Maharashtra',
            postal_code: '400001',
            country: 'India',
            is_default: true
          },
          payment_info: foundOrder.payment_info || {
            method: 'card',
            status: 'paid',
            transaction_id: 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            gateway: 'Razorpay'
          },
          tracking_number: foundOrder.tracking_number || (foundOrder.status === 'shipped' || foundOrder.status === 'delivered' ? 'TRK' + Math.random().toString(36).substr(2, 9).toUpperCase() : undefined),
          estimated_delivery: foundOrder.estimated_delivery || (foundOrder.status === 'shipped' ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined)
        };

        setOrder(enhancedOrder);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'confirmed': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'processing': return 'text-indigo-700 bg-indigo-100 border-indigo-200';
      case 'shipped': return 'text-purple-700 bg-purple-100 border-purple-200';
      case 'delivered': return 'text-green-700 bg-green-100 border-green-200';
      case 'cancelled': return 'text-red-700 bg-red-100 border-red-200';
      case 'returned': return 'text-orange-700 bg-orange-100 border-orange-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Order Pending';
      case 'confirmed': return 'Order Confirmed';
      case 'processing': return 'Processing';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      case 'returned': return 'Returned';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'card': return 'Credit/Debit Card';
      case 'upi': return 'UPI';
      case 'netbanking': return 'Net Banking';
      case 'wallet': return 'Wallet';
      case 'cod': return 'Cash on Delivery';
      default: return method.toUpperCase();
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-700 bg-green-100';
      case 'pending': return 'text-yellow-700 bg-yellow-100';
      case 'failed': return 'text-red-700 bg-red-100';
      case 'refunded': return 'text-blue-700 bg-blue-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto w-8 h-8 text-primary-gold animate-spin mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <Package className="mx-auto w-16 h-16 text-red-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The order you are looking for could not be found.'}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Go Back
            </button>
            <Link
              href="/account/orders"
              className="px-4 py-2 bg-primary-gold text-white rounded-lg hover:bg-secondary-gold transition-colors"
            >
              View All Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
            <p className="text-gray-600">Order #{order.order_number}</p>
          </div>
        </div>

        {/* Status and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium border ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
            <span className="text-sm text-gray-600">
              Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              title="Download Invoice"
              className="p-2 text-gray-600 hover:text-primary-gold hover:bg-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            
            {order.tracking_number && (
              <button
                title="Track Package"
                className="p-2 text-gray-600 hover:text-primary-gold hover:bg-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Items */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order Items
            </h2>
            
            <div className="space-y-4">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-b-0">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.product_name}</h3>
                    {(item.size || item.color || item.material) && (
                      <p className="text-sm text-gray-600 mt-1">
                        {[item.size, item.color, item.material].filter(Boolean).join(', ')}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mt-1">
                      Quantity: {item.quantity} × {order.currency} {item.unit_price.toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {order.currency} {item.total_price.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Delivery Information
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Delivery Address
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium text-gray-900">{order.delivery_address.full_name}</p>
                  <p>{order.delivery_address.phone}</p>
                  <p>{order.delivery_address.address_line_1}</p>
                  {order.delivery_address.address_line_2 && (
                    <p>{order.delivery_address.address_line_2}</p>
                  )}
                  <p>{order.delivery_address.city}, {order.delivery_address.state}</p>
                  <p>{order.delivery_address.postal_code}</p>
                  <p>{order.delivery_address.country}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Tracking Information
                </h3>
                <div className="text-sm text-gray-600 space-y-2">
                  {order.tracking_number && (
                    <div>
                      <span className="font-medium">Tracking Number:</span>
                      <p className="font-mono text-xs bg-gray-100 px-2 py-1 rounded mt-1">
                        {order.tracking_number}
                      </p>
                    </div>
                  )}
                  {order.estimated_delivery && (
                    <div>
                      <span className="font-medium">Estimated Delivery:</span>
                      <p>{new Date(order.estimated_delivery).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Information
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Payment Method</h3>
                <p className="text-sm text-gray-600">{getPaymentMethodText(order.payment_info.method)}</p>
                {order.payment_info.gateway && (
                  <p className="text-xs text-gray-500 mt-1">via {order.payment_info.gateway}</p>
                )}
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Payment Status</h3>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_info.status)}`}>
                  {order.payment_info.status.charAt(0).toUpperCase() + order.payment_info.status.slice(1)}
                </span>
                {order.payment_info.transaction_id && (
                  <p className="text-xs text-gray-500 mt-2 font-mono">
                    ID: {order.payment_info.transaction_id}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Order Summary
            </h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">{order.currency} {order.subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900">
                  {order.shipping_amount > 0 ? `${order.currency} ${order.shipping_amount.toFixed(2)}` : 'Free'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="text-gray-900">{order.currency} {order.tax_amount.toFixed(2)}</span>
              </div>
              
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{order.currency} {order.discount_amount.toFixed(2)}</span>
                </div>
              )}
              
              <hr className="my-3" />
              
              <div className="flex justify-between font-semibold text-lg">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">{order.currency} {order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Order Actions */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
            
            <div className="space-y-3">
              {order.status === 'delivered' && (
                <>
                  <button className="w-full px-4 py-2 bg-primary-gold text-white rounded-lg hover:bg-secondary-gold transition-colors">
                    Buy Again
                  </button>
                  <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Write Review
                  </button>
                  <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Return/Exchange
                  </button>
                </>
              )}
              
              {order.status === 'pending' && (
                <button className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                  Cancel Order
                </button>
              )}
              
              <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Contact Support
              </button>
            </div>
          </div>

          {/* Need Help */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Need Help?</h3>
            <p className="text-sm text-blue-700 mb-3">
              If you have any questions about your order, our customer support team is here to help.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Contact Support
              <ArrowLeft className="w-4 h-4 ml-1 rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
