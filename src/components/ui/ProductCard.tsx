'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Star, Eye, Zap, Truck, AlertCircle, X } from 'lucide-react';
import { useCartStore, useWishlistStore, useUIStore } from '@/store/useStore';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: Array<{
    url: string;
    altText: string;
  }>;
  category: {
    name: string;
    slug: string;
  };
  averageRating?: number;
  reviewCount?: number;
  variants?: Array<{
    id: string;
    color?: string;
    size?: string;
    price?: number;
    stock: number;
  }>;
  tags?: string[];
}

interface ProductCardProps {
  product: Product;
  variant?: 'grid' | 'list';
  showQuickAdd?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  variant = 'grid', 
  showQuickAdd = true 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{message: string; details?: any} | null>(null);
  
  // Error popup stays visible until manually closed
  // No auto-dismiss functionality
  
  const addToCart = useCartStore(state => state.addItem);
  const addToWishlist = useWishlistStore(state => state.addItem);
  const removeFromWishlist = useWishlistStore(state => state.removeItem);
  const isInWishlist = useWishlistStore(state => state.isInWishlist);
  const { currentCurrency } = useUIStore();

  const discountPercentage = product.compareAtPrice 
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const getCurrencySymbol = () => {
    switch (currentCurrency) {
      case 'USD': return '$';
      case 'GBP': return '£';
      case 'EUR': return '€';
      case 'AUD': return 'A$';
      default: return '₹';
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLoading(true);
    setError(null); // Clear any previous errors
    
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          product_id: product.id,
          quantity: 1 
        })
      });

      const result = await response.json();

      if (result.success) {
        // Also update local store for immediate UI feedback
        const availableVariant = product.variants?.find(v => v.stock > 0);
        addToCart({
          id: `${product.id}-${availableVariant?.id || 'default'}-${Date.now()}`,
          productId: product.id,
          variantId: availableVariant?.id,
          name: product.name,
          image: product.images[0]?.url || '/placeholder-product.jpg',
          price: availableVariant?.price || product.price,
          compareAtPrice: product.compareAtPrice,
          options: availableVariant ? {
            color: availableVariant.color || '',
            size: availableVariant.size || '',
          } : undefined,
          sku: product.slug,
          inStock: (availableVariant?.stock || 0) > 0,
        });
        
        if (result.warning) {
          console.warn('Cart API warning:', result.warning);
        }
      } else {
        // Handle API errors with details
        console.log('ProductCard API Error Result:', result);
        setError({ 
          message: result.error || 'Failed to add to cart',
          details: result.details 
        });
      }
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      setError({ 
        message: 'Failed to add to cart. Please try again.',
        details: null 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        productId: product.id,
        name: product.name,
        image: product.images[0]?.url || '/placeholder-product.jpg',
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        slug: product.slug,
      });
    }
  };

  const isOutOfStock = product.variants 
    ? product.variants.every(v => v.stock === 0)
    : false;

  const totalStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
  const isLowStock = totalStock > 0 && totalStock <= 5;

  if (variant === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden">
        <div className="flex">
          {/* Product Image */}
          <div className="relative w-48 h-48 flex-shrink-0">
            <Link href={`/products/${product.slug}`}>
              <Image
                src={product.images[0]?.url || '/placeholder-product.jpg'}
                alt={product.images[0]?.altText || product.name}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
            </Link>
            
            {/* Discount Badge Only */}
            {discountPercentage > 0 && (
              <div className="absolute top-2 left-2">
                <span className="bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
                  {discountPercentage}% OFF
                </span>
              </div>
            )}

            {/* Wishlist Button */}
            <button
              onClick={handleWishlistToggle}
              className={`absolute top-2 right-2 p-2 rounded-full shadow-sm transition-all ${
                isInWishlist(product.id)
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
            </button>

            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-semibold bg-black/75 px-3 py-1 rounded">
                  Out of Stock
                </span>
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div>
              <Link href={`/products/${product.slug}`}>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  {product.category.name}
                </p>
                <h3 className="font-semibold text-gray-900 hover:text-primary-gold transition-colors mb-2 line-clamp-2">
                  {product.name}
                </h3>
              </Link>
              
              {/* Rating */}
              {product.averageRating && (
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(product.averageRating!)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    ({product.reviewCount})
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-xl font-bold text-gray-900">
                  {getCurrencySymbol()}{product.price.toLocaleString()}
                </span>
                {product.compareAtPrice && (
                  <>
                    <span className="text-sm text-gray-500 line-through">
                      {getCurrencySymbol()}{product.compareAtPrice.toLocaleString()}
                    </span>
                    <span className="text-sm text-green-600 font-medium">
                      {discountPercentage}% off
                    </span>
                  </>
                )}
              </div>

              {/* Delivery Info */}
              <div className="flex items-center text-sm text-gray-600 mb-3">
                <Truck className="w-4 h-4 mr-1" />
                <span>Free delivery by tomorrow</span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isLoading}
                className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all ${
                  isOutOfStock
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : isLoading
                    ? 'bg-primary-gold/70 text-white cursor-wait'
                    : 'bg-primary-gold text-white hover:bg-secondary-gold'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Adding...
                  </div>
                ) : isOutOfStock ? (
                  'Out of Stock'
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 inline mr-2" />
                    Add to Cart
                  </>
                )}
              </button>
              
              <Link
                href={`/products/${product.slug}`}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Eye className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid variant (default)
  return (
    <div 
      className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl border border-gray-100 hover:border-gray-200 transition-all duration-500 overflow-hidden transform hover:scale-[1.02] hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
          <Image
            src={product.images[currentImageIndex]?.url || '/placeholder-product.jpg'}
            alt={product.images[currentImageIndex]?.altText || product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Overlay gradient for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Discount Badge Only */}
          {discountPercentage > 0 && (
            <div className="absolute top-4 left-4 z-10">
              <span className="inline-flex items-center bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 text-xs font-bold rounded-full shadow-lg">
                {discountPercentage}% OFF
              </span>
            </div>
          )}

          {/* Quick Actions */}
          <div className={`absolute top-4 right-4 flex flex-col space-y-3 transform transition-all duration-500 z-20 ${
            isHovered ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-8 opacity-0 scale-95'
          }`}>
            <button
              onClick={handleWishlistToggle}
              className={`p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${
                isInWishlist(product.id)
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-red-200'
                  : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:text-red-500 hover:bg-white shadow-gray-200'
              }`}
              title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `/products/${product.slug}`;
              }}
              className="p-3 bg-white/90 backdrop-blur-sm text-gray-600 hover:text-blue-600 hover:bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
              title="Quick view"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20 flex items-center justify-center z-30 backdrop-blur-sm">
              <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl border border-white/20 transform rotate-[-2deg]">
                <span className="text-gray-900 font-bold text-sm tracking-wide">
                  OUT OF STOCK
                </span>
              </div>
            </div>
          )}

          {/* Image Indicators */}
          {product.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onMouseEnter={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-6">
        <Link href={`/products/${product.slug}`}>
          <div className="mb-3">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">
              {product.category.name}
            </p>
            <h3 className="font-bold text-gray-900 hover:text-blue-600 transition-colors duration-200 mb-1 line-clamp-2 text-base leading-tight group-hover:text-blue-600">
              {product.name}
            </h3>
          </div>
        </Link>

        {/* Rating */}
        {product.averageRating && (
          <div className="flex items-center mb-4">
            <div className="flex items-center bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md">
              <span>{product.averageRating}</span>
              <Star className="w-3 h-3 ml-1 fill-current" />
            </div>
            <span className="ml-3 text-xs text-gray-600 font-medium">
              ({product.reviewCount?.toLocaleString()} reviews)
            </span>
          </div>
        )}

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-bold text-gray-900">
              {getCurrencySymbol()}{product.price.toLocaleString()}
            </span>
            {product.compareAtPrice && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 line-through">
                  {getCurrencySymbol()}{product.compareAtPrice.toLocaleString()}
                </span>
                <span className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-xs font-bold rounded-full">
                  {discountPercentage}% OFF
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Delivery Info */}
        <div className="flex items-center justify-between text-xs mb-4">
          <div className="flex items-center text-gray-600">
            <Truck className="w-3 h-3 mr-1.5" />
            <span className="font-medium">Free delivery</span>
          </div>
          <div className="flex items-center text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse" />
            <span className="font-medium">In stock</span>
          </div>
        </div>

        {/* Quick Add Button */}
        {showQuickAdd && (
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isLoading}
            className={`w-full py-3 font-semibold text-sm transition-all duration-300 rounded-xl transform ${
              isOutOfStock
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : isLoading
                ? 'bg-gradient-to-r from-blue-400 to-purple-400 text-white cursor-wait scale-95'
                : isHovered
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white border border-gray-200 hover:border-blue-300 hover:scale-105'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                <span>Adding...</span>
              </div>
            ) : isOutOfStock ? (
              <span>Out of Stock</span>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </div>
            )}
          </button>
        )}
      </div>
      
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

export default ProductCard;
