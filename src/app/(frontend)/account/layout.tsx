'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import { 
  User, 
  Package, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import Header from '@/components/layout/Header';

interface AccountLayoutProps {
  children: React.ReactNode;
}

const AccountLayout = ({ children }: AccountLayoutProps) => {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navigationItems = [
    {
      href: '/account/orders',
      icon: Package,
      label: 'Orders',
      description: 'Track and manage your orders'
    }
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="min-h-screen dark-gradient">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Mobile Menu Button */}
          <div className="lg:hidden mb-6">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex items-center space-x-2 text-gray-700 hover:text-primary-gold transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
              <span>Account Menu</span>
            </button>
          </div>

          {/* Sidebar Navigation */}
          <div className={`lg:col-span-1 ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* User Info */}
              <div className="p-6 bg-gradient-to-r from-primary-gold to-secondary-gold text-white">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary-gold" />
                  </div>
                  <div>
                    <h2 className="font-semibold">John Doe</h2>
                    <p className="text-sm opacity-90">john.doe@example.com</p>
                  </div>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="p-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        active
                          ? 'bg-primary-gold text-white'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-primary-gold'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{item.label}</div>
                        {!active && (
                          <div className="text-sm text-gray-500 truncate">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </nav>

              {/* Logout */}
              <div className="border-t border-gray-200 p-2">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px]">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountLayout;
