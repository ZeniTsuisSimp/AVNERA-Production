'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import HeroSection from '@/components/layout/HeroSection';
import AddToCartButton from '@/components/ui/AddToCartButton';
import OrderNotification from '@/components/notifications/OrderNotification';
import Link from 'next/link';

// Fallback products if API fails - using UUID format for cart compatibility
const fallbackProducts = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Sample Silk Saree',
    slug: 'sample-silk-saree',
    price: 2999,
    image: 'https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '22222222-2222-2222-2222-222222222222', 
    name: 'Sample Lehenga Choli',
    slug: 'sample-lehenga-choli',
    price: 4999,
    image: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Sample Party Gown',
    slug: 'sample-party-gown', 
    price: 4299,
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  }
];

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState(fallbackProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        // Try to create sample products first if none exist
        try {
          await fetch('/api/test/create-products', { method: 'POST' });
        } catch {
          // Ignore errors - products might already exist
        }

        // Fetch products from API
        const response = await fetch('/api/products?limit=3');
        console.log('Homepage products API response status:', response.status);
        if (response.ok) {
          const result = await response.json();
          console.log('Homepage products API result:', result);
          if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
            // Transform API data to match expected format
            const transformedProducts = result.data.slice(0, 3).map((product: any, index: number) => ({
              id: product.id,
              name: product.name,
              slug: product.slug || product.name.toLowerCase().replace(/\s+/g, '-'),
              price: product.price,
              image: [
                'https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
                'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 
                'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
              ][index] || `https://placehold.co/600x800/f1f5f9/64748b?text=${encodeURIComponent(product.name)}`
            }));
            
            setFeaturedProducts(transformedProducts);
          }
        }
      } catch (error) {
        console.error('Failed to load featured products:', error);
        console.error('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : 'No stack trace',
          error
        });
        // Keep fallback products
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);
  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Order Notification - Shows recent order confirmations */}
      <OrderNotification />
      
      {/* Featured Products */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="brand-font text-3xl md:text-4xl mb-4 text-black">
              New Arrivals
            </h2>
            <div className="w-16 h-0.5 bg-primary-gold mx-auto"></div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-gray-200 rounded"></div>
                  <div className="pt-4 text-center">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-3"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <Link key={product.id} href={`/products/${product.slug}`} className="group cursor-pointer">
                  <div className="aspect-[3/4] relative overflow-hidden bg-gray-50">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="pt-4 text-center">
                    <h3 className="text-lg font-light mb-2 text-black uppercase tracking-wide">{product.name}</h3>
                    <p className="text-gray-600 mb-3">₹{product.price.toLocaleString()}</p>
                    <AddToCartButton productId={product.id} productName={product.name} className="text-sm px-4 py-2" />
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          <div className="text-center mt-16">
            <Link href="/products" className="minimal-button-outline">
              View All
            </Link>
          </div>
        </div>
      </section>
      
      {/* Newsletter */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="brand-text text-2xl md:text-3xl mb-4 text-black uppercase tracking-wide">Stay Updated</h2>
          <p className="mb-12 text-gray-600 max-w-lg mx-auto">Get notified about new arrivals and exclusive offers</p>
          
          <div className="max-w-md mx-auto flex gap-2">
            <input 
              type="email" 
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 focus:border-black focus:outline-none transition-colors"
            />
            <button className="minimal-button px-8">
              Subscribe
            </button>
          </div>
          
          <div className="mt-16">
            <div className="w-16 h-0.5 bg-primary-gold mx-auto"></div>
          </div>
        </div>
      </section>
    </main>
  );
}
