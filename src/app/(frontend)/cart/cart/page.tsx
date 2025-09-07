'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
import Header from '@/components/layout/Header';

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

const CartPage = () => {
  const { user } = useUser();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCartItems();
    }
  }, [user]);

  const fetchCartItems = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/cart');
      const result = await response.json();
      
      if (result.success) {
        setCartItems(result.data.items || []);
      } else {
        console.error('Failed to fetch cart:', result.error);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeItem(itemId);
      return;
    }

    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (response.ok) {
        await fetchCartItems(); // Refresh cart
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchCartItems(); // Refresh cart
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const clearCart = async () => {
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE'
      });

      if (response.ok) {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => total + (item.products.price * item.quantity), 0);
  const shipping = subtotal >= 999 ? 0 : 99;
  const tax = Math.round(subtotal * 0.18); // 18% GST
  const total = subtotal + shipping + tax;
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <h1 className="text-2xl font-bold text-gray-900 mt-4">Loading your cart...</h1>
          </div>
        </main>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-8" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-lg text-gray-600 mb-8">
              Discover amazing products and start building your perfect collection
            </p>
            <Link 
              href="/products"
              className="inline-flex items-center bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
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
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">Shopping Cart</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
            <p className="text-gray-600">
              {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          {totalItems > 0 && (
            <button
              onClick={clearCart}
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Cart
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start space-x-6">
                  {/* Product Image Placeholder */}
                  <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="w-8 h-8 text-gray-400" />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          <Link 
                            href={`/products/${item.products.slug}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {item.products.name}
                          </Link>
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {item.products.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-900">
                            ₹{item.products.price.toLocaleString()}
                          </span>
                          <div className="flex items-center space-x-3">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-2 hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900 disabled:opacity-50"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="px-4 py-2 text-center text-gray-900 font-medium bg-gray-50 min-w-[3rem]">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-2 hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            {/* Remove Button */}
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                              title="Remove Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Item total:</span>
                        <span className="font-semibold text-gray-900">
                          ₹{(item.products.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                  <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (18% GST)</span>
                  <span className="font-medium">₹{tax.toLocaleString()}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {shipping > 0 && (
                <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    Add ₹{(999 - subtotal).toLocaleString()} more to get FREE shipping!
                  </p>
                </div>
              )}

              {/* Checkout Button */}
              <Link
                href="/checkout"
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>

              <Link
                href="/products"
                className="w-full mt-3 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CartPage;
