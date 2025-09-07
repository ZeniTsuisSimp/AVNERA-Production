'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Tag, Sparkles, Gift, Shield, Clock, Zap, AlertCircle, X } from 'lucide-react';
import Header from '@/components/layout/Header';
import { useUser } from '@clerk/nextjs';

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
  const searchParams = useSearchParams();
  const { user } = useUser();
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckoutMode, setIsCheckoutMode] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{code: string, discount: number} | null>(null);
  const [error, setError] = useState<{message: string; details?: unknown} | null>(null);

  // Check if user came from "Buy Now"
  useEffect(() => {
    const checkout = searchParams.get('checkout');
    if (checkout === 'true') {
      setIsCheckoutMode(true);
    }
  }, [searchParams]);

  // Fetch cart items from database
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

    setError(null); // Clear any previous errors
    
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity })
      });

      const result = await response.json();

      if (result.success) {
        await fetchCartItems(); // Refresh cart
      } else {
        // Handle API errors with details
        console.log('Cart update error:', result);
        setError({ 
          message: result.error || 'Failed to update cart',
          details: result.details 
        });
      }
    } catch (error: unknown) {
      console.error('Error updating quantity:', error);
      setError({ 
        message: 'Failed to update quantity. Please try again.',
        details: null 
      });
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

  const handleApplyPromo = () => {
    const validPromos = {
      'SAVE10': 10,
      'WELCOME15': 15,
      'FIRST20': 20
    };

    if (validPromos[promoCode as keyof typeof validPromos]) {
      setAppliedPromo({
        code: promoCode,
        discount: validPromos[promoCode as keyof typeof validPromos]
      });
      setPromoCode('');
    } else {
      alert('Invalid promo code');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
  };

  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => total + (item.products.price * item.quantity), 0);
  const discount = appliedPromo ? (subtotal * appliedPromo.discount / 100) : 0;
  const shipping = subtotal >= 999 ? 0 : 99;
  const total = subtotal - discount + shipping;
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-20">
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full animate-pulse" />
              <div className="relative w-full h-full flex items-center justify-center">
                <ShoppingBag className="w-16 h-16 text-gray-400" />
              </div>
            </div>
            <div className="max-w-md mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Your cart is empty
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Discover amazing products and start building your perfect collection
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/products"
                  className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Sparkles className="w-5 h-5 mr-2 group-hover:animate-spin" />
                  Explore Products
                </Link>
                <Link 
                  href="/"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-blue-600 transition-colors duration-200">
            Home
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">Shopping Cart</span>
        </nav>

        {/* Checkout Mode Banner */}
        {isCheckoutMode && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-green-900">Fast Checkout Mode</h3>
                <p className="text-sm text-green-700">You clicked &quot;Buy Now&quot; - ready for quick checkout!</p>
              </div>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isCheckoutMode ? 'Fast Checkout' : 'Shopping Cart'}
            </h1>
            <p className="text-gray-600">
              {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          {totalItems > 0 && (
            <button
              onClick={clearCart}
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all duration-200"
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
              <div 
                key={item.id} 
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-gray-200 p-6 transition-all duration-300 hover:transform hover:scale-[1.02]"
              >
                <div className="flex items-start space-x-6">
                  {/* Product Image Placeholder */}
                  <div className="relative w-28 h-28 flex-shrink-0 bg-gray-200 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="w-12 h-12 text-gray-400" />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2 text-lg leading-tight">
                          <Link 
                            href={`/products/${item.products.slug}`}
                            className="hover:text-blue-600 transition-colors duration-200 group-hover:text-blue-600"
                          >
                            {item.products.name}
                          </Link>
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {item.products.description}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 rounded-xl border border-gray-200 hover:border-red-200 hover:scale-110"
                          title="Remove Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Price and Quantity */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl font-bold text-gray-900">
                          ₹{item.products.price}
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-3 hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900 disabled:opacity-50"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-3 min-w-[3rem] text-center text-gray-900 font-semibold bg-white border-x border-gray-200">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-3 hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Item Total & Stock Status */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-sm font-medium text-green-700">
                            In Stock ({item.products.stock_quantity})
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          • Ships in 2-3 days
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 mb-1">Item Total</div>
                        <span className="text-xl font-bold text-gray-900">
                          ₹{(item.products.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue Shopping */}
            <div className="pt-8">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Keep Shopping
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Discover more amazing products in our collection
                    </p>
                  </div>
                  <Link 
                    href="/products"
                    className="inline-flex items-center space-x-2 bg-white text-gray-700 hover:text-blue-600 transition-all duration-200 font-medium px-6 py-3 rounded-xl shadow-sm hover:shadow-md hover:scale-105 border border-gray-200 hover:border-blue-200"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Browse Products</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-8 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-blue-600" />
                </div>
              </div>

              {/* Promo Code */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-semibold text-gray-900">
                    Promo Code
                  </label>
                  <Gift className="w-4 h-4 text-gray-400" />
                </div>
                {appliedPromo ? (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Tag className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-green-800">
                            {appliedPromo.code}
                          </span>
                          <p className="text-xs text-green-600">
                            {appliedPromo.discount}% discount applied
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleRemovePromo}
                        className="text-green-600 hover:text-red-500 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all duration-200 border border-green-200 hover:border-red-200"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="Enter promo code"
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 placeholder-gray-500 transition-colors"
                      />
                      <button
                        onClick={handleApplyPromo}
                        disabled={!promoCode.trim()}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        Apply
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs text-gray-500">Try:</span>
                      {['SAVE10', 'WELCOME15', 'FIRST20'].map((code) => (
                        <button
                          key={code}
                          onClick={() => setPromoCode(code)}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-blue-100 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          {code}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="space-y-4 mb-8">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                    <span className="text-gray-900 font-semibold">₹{subtotal.toFixed(2)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Discount</span>
                      <span className="text-green-600 font-semibold">-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">Shipping</span>
                      <Clock className="w-3 h-3 text-gray-400" />
                    </div>
                    <span className="text-gray-900 font-semibold">
                      {shipping === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `₹${shipping}`
                      )}
                    </span>
                  </div>
                </div>
                
                {shipping === 0 && subtotal >= 999 && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm font-medium text-green-800">
                        Congratulations! You qualify for free shipping
                      </span>
                    </div>
                  </div>
                )}
                
                {shipping > 0 && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-800">
                        Add ₹{(999 - subtotal).toFixed(2)} more for free shipping
                      </span>
                      <div className="w-16 h-1 bg-blue-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min((subtotal / 999) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-gray-900">
                        ₹{total.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Inclusive of all taxes</p>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <Link 
                href="/checkout"
                className="block w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 transform text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <div className="flex items-center justify-center space-x-2">
                  {isCheckoutMode ? (
                    <>
                      <Zap className="w-5 h-5" />
                      <span>Complete Fast Checkout</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      <span>Proceed to Checkout</span>
                    </>
                  )}
                </div>
              </Link>

              {/* Security & Trust Indicators */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>Secure checkout with 256-bit SSL encryption</span>
                </div>
                
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-500 text-center mb-3">Accepted payment methods</p>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-2 flex items-center justify-center">
                      <span className="text-xs font-bold">VISA</span>
                    </div>
                    <div className="bg-gradient-to-br from-red-500 to-orange-500 text-white rounded-lg p-2 flex items-center justify-center">
                      <span className="text-xs font-bold">MC</span>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-lg p-2 flex items-center justify-center">
                      <span className="text-xs font-bold">UPI</span>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-teal-500 text-white rounded-lg p-2 flex items-center justify-center">
                      <span className="text-xs font-bold">GPay</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="w-4 h-4 text-green-600" />
                    <div>
                      <span className="font-medium text-green-800">Fast delivery: </span>
                      <span className="text-green-700">Ships within 2-3 business days</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Inline Error Popup */}
      {error && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className="bg-white rounded-xl shadow-2xl border border-red-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-3 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-semibold text-sm">Stock Alert</span>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-3">
              <p className="text-gray-800 text-xs font-medium mb-2">{error.message}</p>
              
              {error.details && (
                <div className="space-y-1.5 text-xs">
                  {error.details.available_stock !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Available:</span>
                      <span className="font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                        {error.details.available_stock}
                      </span>
                    </div>
                  )}
                  
                  {error.details.current_in_cart !== undefined && error.details.current_in_cart > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">In Cart:</span>
                      <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {error.details.current_in_cart}
                      </span>
                    </div>
                  )}
                  
                  {error.details.max_can_add !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Can Add:</span>
                      <span className={`font-semibold px-2 py-0.5 rounded ${
                        error.details.max_can_add > 0 
                          ? 'text-green-700 bg-green-50' 
                          : 'text-red-700 bg-red-50'
                      }`}>
                        {error.details.max_can_add > 0 ? error.details.max_can_add : '0'}
                      </span>
                    </div>
                  )}
                  
                  {error.details.available_stock === 0 && (
                    <div className="mt-2 p-2 bg-red-50 rounded border border-red-100">
                      <p className="text-xs text-red-700 font-medium text-center">
                        🚫 Out of Stock
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
