'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface OrderStats {
  totalOrders: number;
  totalSpent: number;
  currency: string;
}

const AccountStats = () => {
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    totalSpent: 0,
    currency: 'INR'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all orders to calculate stats
        const response = await fetch('/api/orders?limit=1000&page=1');
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch order statistics');
        }
        
        const orders = data.data || [];
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum: number, order: any) => {
          return sum + (order.total_amount || 0);
        }, 0);
        const currency = orders.length > 0 ? orders[0].currency : 'INR';
        
        setStats({
          totalOrders,
          totalSpent,
          currency
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div>
        <h3 className="text-md font-medium text-gray-900 mb-4">Statistics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Loader2 className="w-6 h-6 text-primary-gold animate-spin mr-2" />
              <div className="text-sm text-gray-600">Loading...</div>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Loader2 className="w-6 h-6 text-primary-gold animate-spin mr-2" />
              <div className="text-sm text-gray-600">Loading...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h3 className="text-md font-medium text-gray-900 mb-4">Statistics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-400">--</div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-400">--</div>
            <div className="text-sm text-gray-600">Total Spent</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-400">--</div>
            <div className="text-sm text-gray-600">Wishlist Items</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-md font-medium text-gray-900 mb-4">Statistics</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-primary-gold">{stats.totalOrders}</div>
          <div className="text-sm text-gray-600">Total Orders</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-primary-gold">
            {stats.currency} {stats.totalSpent.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">Total Spent</div>
        </div>
      </div>
      <div className="mt-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-primary-gold">--</div>
          <div className="text-sm text-gray-600">Wishlist Items</div>
          <div className="text-xs text-gray-500 mt-1">Coming soon</div>
        </div>
      </div>
    </div>
  );
};

export default AccountStats;
