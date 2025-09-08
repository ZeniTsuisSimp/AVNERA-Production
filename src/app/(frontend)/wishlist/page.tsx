'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, ArrowLeft, Trash2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import { useCartStore, useWishlistStore, useUIStore } from '@/store/useStore';

const WishlistPage = () => {
  const { items: wishlistItems, removeItem, clearWishlist } = useWishlistStore();
  const addToCart = useCartStore(state => state.addItem);
  const { currentCurrency } = useUIStore();

  const getCurrencySymbol = () => {
    switch (currentCurrency) {
      case 'USD': return '$';
      case 'GBP': return '£';
      case 'EUR': return '€';
      case 'AUD': return 'A$';
      default: return '₹';
    }
  };

  const handleAddToCart = (item: { id: string; name: string; image: string; price: number; originalPrice?: number; slug: string }) => {
    addToCart({
      id: `${item.id}-default-${Date.now()}`,
      name: item.name,
      image: item.image,
      price: item.price,
    });
  };

  const handleMoveToCart = (item: { id: string; name: string; image: string; price: number; originalPrice?: number; slug: string }) => {
    handleAddToCart(item);
    removeItem(item.id);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
              <Heart className="w-full h-full" />
            </div>
            <h1 className="text-3xl font-brand text-charcoal mb-4">Your Wishlist is Empty</h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Save items you love to your wishlist. Review them anytime and easily move them to your cart.
            </p>
            <Link 
              href="/products"
              className="inline-flex items-center space-x-2 bg-primary-gold text-white px-8 py-3 rounded-lg font-medium hover:bg-secondary-gold transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Start Shopping</span>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark-gradient">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-primary-gold">Home</Link>
          <span>/</span>
          <span className="text-gray-900">Wishlist</span>
        </nav>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-brand text-charcoal">
            My Wishlist ({wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'})
          </h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={clearWishlist}
              className="text-sm text-gray-600 hover:text-red-600 transition-colors"
            >
              Clear Wishlist
            </button>
            <button
              onClick={() => {
                wishlistItems.forEach(item => handleAddToCart(item));
                clearWishlist();
              }}
              className="bg-primary-gold text-white px-6 py-2 rounded-lg font-medium hover:bg-secondary-gold transition-colors"
            >
              Add All to Cart
            </button>
          </div>
        </div>

        {/* Wishlist Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {wishlistItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* Product Image */}
              <div className="relative aspect-[4/5] group">
                <Link href={`/products/${item.slug}`}>
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                
                {/* Discount Badge */}
                {item.originalPrice && (
                  <div className="absolute top-2 left-2">
                    <span className="bg-red-500 text-white px-2 py-1 text-xs font-semibold rounded">
                      -{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
                    </span>
                  </div>
                )}

                {/* Remove from Wishlist */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-full shadow-sm transition-colors group"
                >
                  <Heart className="w-4 h-4 text-red-500 fill-current" />
                </button>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <Link href={`/products/${item.slug}`}>
                  <h3 className="font-semibold text-gray-900 hover:text-primary-gold transition-colors mb-2 line-clamp-2">
                    {item.name}
                  </h3>
                </Link>

                {/* Price */}
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-lg font-bold text-charcoal">
                    {getCurrencySymbol()}{item.price}
                  </span>
                  {item.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      {getCurrencySymbol()}{item.originalPrice}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleMoveToCart(item)}
                    className="w-full flex items-center justify-center space-x-2 bg-primary-gold text-white py-2 px-4 rounded-lg hover:bg-secondary-gold transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Move to Cart</span>
                  </button>
                  
                  <div className="flex space-x-2">
                    <Link
                      href={`/products/${item.slug}`}
                      className="flex-1 text-center py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-red-600 transition-colors"
                      title="Remove from Wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Shopping */}
        <div className="text-center">
          <Link 
            href="/products"
            className="inline-flex items-center space-x-2 text-primary-gold hover:text-secondary-gold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Wishlist Benefits */}
        <div className="mt-12 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Why use Wishlist?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-gold rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Save Your Favorites</h3>
              <p className="text-sm text-gray-600">
                Keep track of items you love and want to purchase later.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-gold rounded-full flex items-center justify-center mx-auto mb-3">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Quick Add to Cart</h3>
              <p className="text-sm text-gray-600">
                Easily move items to your cart when you&apos;re ready to buy.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-gold rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-12h5v12z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Price Drop Alerts</h3>
              <p className="text-sm text-gray-600">
                Get notified when items in your wishlist go on sale.
              </p>
            </div>
          </div>
        </div>

        {/* Recently Viewed - Placeholder */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">You Might Also Like</h2>
          <div className="text-center py-8 text-gray-500">
            <p>Browse our collections to discover more items you&apos;ll love</p>
            <Link 
              href="/products"
              className="inline-block mt-4 text-primary-gold hover:text-secondary-gold transition-colors"
            >
              Explore Products →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WishlistPage;
