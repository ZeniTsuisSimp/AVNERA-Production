'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import Link from 'next/link';
import { User, Package, ChevronDown, LogOut } from 'lucide-react';

const AccountDropdown = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) {
    return null;
  }

  const menuItems = [
    {
      href: '/account/orders',
      icon: Package,
      label: 'My Orders',
      description: 'Track and manage orders'
    }
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      setIsOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Account Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
        title="Account Menu"
      >
        <div className="w-8 h-8 bg-primary-gold rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {user.firstName?.charAt(0) || user.emailAddresses[0]?.emailAddress?.charAt(0) || 'U'}
        </div>
        <span className="hidden sm:block text-sm font-medium">
          {user.firstName || 'Account'}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-gold rounded-full flex items-center justify-center text-white font-semibold">
                {user.firstName?.charAt(0) || user.emailAddresses[0]?.emailAddress?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">
                  {user.fullName || 'User'}
                </p>
                <p className="text-xs text-gray-500">
                  {user.emailAddresses[0]?.emailAddress}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Icon className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Logout Section */}
          <div className="border-t border-gray-100 py-2">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
            >
              <LogOut className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-medium text-sm">Sign Out</div>
                <div className="text-xs text-gray-500">Logout from account</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountDropdown;
