'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, ArrowRight, Loader2 } from 'lucide-react';

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  total_amount: number;
  currency: string;
  order_items: OrderItem[];
}

const RecentOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/orders?limit=3&page=1');
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch orders');
        }
        
        setOrders(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch orders');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'processing': return 'text-indigo-600 bg-indigo-100';
      case 'shipped': return 'text-purple-600 bg-purple-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'returned': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'processing': return 'Processing';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      case 'returned': return 'Returned';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <Package className="w-5 h-5 text-red-400" />
        </div>
        <p className="text-sm text-red-600">Failed to load recent orders</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
        <Link 
          href="/account/orders"
          className="flex items-center text-sm text-primary-gold hover:text-secondary-gold transition-colors"
        >
          View All
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
      
      {orders.length === 0 ? (
        <div className="text-center py-8">
          <Package className="mx-auto w-12 h-12 text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm mb-4">No orders yet</p>
          <Link 
            href="/products"
            className="inline-flex items-center px-4 py-2 bg-primary-gold text-white text-sm rounded-lg hover:bg-secondary-gold transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-gray-900 text-sm">
                    {order.order_number}
                  </h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {order.currency} {order.total_amount.toFixed(2)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-600">
                    {order.order_items.length} item{order.order_items.length > 1 ? 's' : ''}
                  </p>
                </div>
                
                <Link
                  href={`/account/orders/${order.id}`}
                  className="text-xs text-primary-gold hover:text-secondary-gold transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentOrders;
