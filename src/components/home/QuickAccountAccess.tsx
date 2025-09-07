'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Package, ArrowRight } from 'lucide-react';

const QuickAccountAccess = () => {
  const { user } = useUser();

  if (!user) {
    return null; // Don't show if user is not logged in
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Welcome back, {user.firstName || 'User'}!
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Quick access to your orders
          </p>
        </div>
        <div className="flex items-center text-primary-gold">
          <ArrowRight className="w-5 h-5" />
        </div>
      </div>
      
      <div className="flex justify-center">
        <div className="w-full max-w-sm">
          <Link
            href="/account/orders"
            className="group flex flex-col items-center p-6 rounded-lg border-2 border-dashed border-blue-200 transition-all duration-200 hover:border-solid hover:shadow-md hover:-translate-y-1 w-full"
          >
            <div className="p-4 rounded-full mb-4 bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="font-medium text-gray-900 text-lg text-center mb-2">
              My Orders
            </h3>
            <p className="text-sm text-gray-600 text-center">
              Track your orders and view history
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuickAccountAccess;
