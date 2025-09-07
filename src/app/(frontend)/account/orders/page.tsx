'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Package, Search, Filter, Eye, Download, RefreshCw, Loader2 } from 'lucide-react';

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

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  currency: string;
  order_items: OrderItem[];
}

const OrdersPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchOrders = async (page = 1, status = 'all') => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString()
      });
      
      if (status !== 'all') {
        params.append('status', status);
      }
      
      const response = await fetch(`/api/orders?${params.toString()}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch orders');
      }
      
      setOrders(data.data || []);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1, statusFilter);
  }, [statusFilter]);

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'shipped': return 'text-purple-600 bg-purple-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-brand text-charcoal">Order History</h1>
        <p className="text-gray-600 mt-1">Track and manage your orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by order number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent outline-none bg-white"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <Loader2 className="mx-auto w-8 h-8 text-primary-gold animate-spin mb-4" />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12">
          <Package className="mx-auto w-16 h-16 text-red-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Orders</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <button 
            onClick={() => fetchOrders(pagination.page, statusFilter)}
            className="inline-flex items-center px-4 py-2 bg-primary-gold text-white rounded-lg hover:bg-secondary-gold transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Orders List */}
      {!loading && !error && filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters' 
              : "You haven't placed any orders yet"
            }
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <Link 
              href="/products" 
              className="inline-flex items-center px-4 py-2 bg-primary-gold text-white rounded-lg hover:bg-secondary-gold transition-colors"
            >
              Start Shopping
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Order Header */}
              <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Order {order.order_number}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Placed on {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)} w-fit`}>
                    {getStatusText(order.status)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">
                    {order.currency} {order.total_amount.toFixed(2)}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <button
                      title="View Details"
                      className="p-2 text-gray-400 hover:text-primary-gold transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    <button
                      title="Download Invoice"
                      className="p-2 text-gray-400 hover:text-primary-gold transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    
                    {(order.status === 'shipped' || order.status === 'delivered') && (
                      <button
                        title="Track Order"
                        className="p-2 text-gray-400 hover:text-primary-gold transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="px-6 py-4">
                <div className="space-y-4">
                  {order.order_items && order.order_items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {item.product_name}
                        </h4>
                        {(item.size || item.color || item.material) && (
                          <p className="text-sm text-gray-600">
                            {[item.size, item.color, item.material].filter(Boolean).join(', ')}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
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

              {/* Order Actions */}
              <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-3">
                {order.status === 'delivered' && (
                  <>
                    <button className="px-4 py-2 bg-primary-gold text-white rounded-lg hover:bg-secondary-gold transition-colors">
                      Buy Again
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      Write Review
                    </button>
                  </>
                )}
                
                {order.status === 'pending' && (
                  <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                    Cancel Order
                  </button>
                )}
                
                <Link
                  href={`/account/orders/${order.id}`}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
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

export default OrdersPage;
