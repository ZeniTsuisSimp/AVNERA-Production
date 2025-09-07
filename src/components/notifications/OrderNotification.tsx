'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Package, X } from 'lucide-react';

const OrderNotification = () => {
  const { user } = useUser();
  const [recentOrders, setRecentOrders] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchRecentOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/orders?limit=1&page=1');
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
          const latestOrder = data.data[0];
          const orderDate = new Date(latestOrder.created_at);
          const now = new Date();
          const hoursSinceOrder = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
          
          // Show notification if order was placed within last 24 hours and user hasn't dismissed it
          if (hoursSinceOrder < 24) {
            const dismissedNotifications = JSON.parse(localStorage.getItem('dismissedOrderNotifications') || '[]');
            if (!dismissedNotifications.includes(latestOrder.id)) {
              setRecentOrders([latestOrder]);
              setShowNotification(true);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch recent orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentOrders();
  }, [user]);

  const dismissNotification = () => {
    if (recentOrders.length > 0) {
      const dismissedNotifications = JSON.parse(localStorage.getItem('dismissedOrderNotifications') || '[]');
      dismissedNotifications.push(recentOrders[0].id);
      localStorage.setItem('dismissedOrderNotifications', JSON.stringify(dismissedNotifications));
    }
    setShowNotification(false);
  };

  if (!user || !showNotification || loading || recentOrders.length === 0) {
    return null;
  }

  const order = recentOrders[0];

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 mx-4 sm:mx-6 lg:mx-8">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Package className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-green-800">
              Order Placed Successfully!
            </h3>
            <div className="mt-1 text-sm text-green-700">
              <p>
                Your order <strong>{order.order_number}</strong> has been placed and is being processed.
              </p>
              <div className="mt-2">
                <Link
                  href={`/account/orders`}
                  className="inline-flex items-center text-green-800 hover:text-green-900 font-medium"
                >
                  Track your order
                  <span className="ml-1">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={dismissNotification}
            className="inline-flex text-green-400 hover:text-green-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderNotification;
