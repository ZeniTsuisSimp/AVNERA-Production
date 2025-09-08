'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Star, Truck, Shield, RotateCcw, Share2, ChevronLeft, ChevronRight, Plus, Minus, Zap } from 'lucide-react';
import Header from '@/components/layout/Header';
import ProductCard from '@/components/ui/ProductCard';
import { useCartStore, useWishlistStore, useUIStore } from '@/store/useStore';

// Sample product data - In real app, this would come from API
const sampleProduct = {
  id: '1',
  name: 'Elegant Silk Saree',
  slug: 'elegant-silk-saree',
  description: 'Experience the epitome of elegance with our handcrafted silk saree. This exquisite piece features intricate zari work and traditional motifs that celebrate the rich heritage of Indian craftsmanship. Perfect for weddings, festivals, and special occasions.',
  price: 2999,
  compareAtPrice: 3999,
  images: [
    {
      url: 'https://placehold.co/600x800/f1f5f9/64748b?text=Elegant+Silk+Saree',
      altText: 'Elegant Silk Saree - Main View'
    },
    {
      url: 'https://placehold.co/600x800/e0f2fe/0369a1?text=Detail+View',
      altText: 'Elegant Silk Saree - Detail View'
    },
    {
      url: 'https://placehold.co/600x800/fef3c7/d97706?text=Model+Shot',
      altText: 'Elegant Silk Saree - Model Shot'
    }
  ],
  category: { name: 'Sarees', slug: 'sarees' },
  averageRating: 4.5,
  reviewCount: 24,
  variants: [
    { id: '1-1', color: 'Red', size: 'Free Size', price: 2999, stock: 5 },
    { id: '1-2', color: 'Blue', size: 'Free Size', price: 2999, stock: 3 },
    { id: '1-3', color: 'Green', size: 'Free Size', price: 3299, stock: 2 }
  ],
  tags: ['new', 'bestseller'],
  features: [
    'Premium silk fabric',
    'Handcrafted zari work',
    'Traditional motifs',
    'Comes with matching blouse piece',
    'Dry clean only'
  ],
  careInstructions: 'Dry clean only. Store in a cool, dry place. Avoid direct sunlight.',
  material: 'Pure Silk with Zari Work',
  reviews: [
    {
      id: '1',
      user: { name: 'Priya Singh', avatar: null },
      rating: 5,
      title: 'Absolutely Beautiful!',
      content: 'This saree exceeded my expectations. The quality is amazing and the color is exactly as shown in the pictures. Perfect for my wedding!',
      createdAt: '2024-01-15',
      isVerified: true
    },
    {
      id: '2',
      user: { name: 'Meera Patel', avatar: null },
      rating: 4,
      title: 'Great quality',
      content: 'Beautiful saree with excellent craftsmanship. The zari work is intricate and well done. Delivery was quick too.',
      createdAt: '2024-01-10',
      isVerified: true
    }
  ]
};

const relatedProducts = [
  {
    id: '2',
    name: 'Designer Kurti Set',
    slug: 'designer-kurti-set',
    price: 1899,
    compareAtPrice: 2499,
    images: [
      {
        url: 'https://placehold.co/600x800/e0f2fe/0369a1?text=Designer+Kurti',
        altText: 'Designer Kurti Set'
      }
    ],
    category: { name: 'Kurtis', slug: 'kurtis' },
    averageRating: 4.2,
    reviewCount: 18,
    variants: [
      { id: '2-1', color: 'Pink', size: 'S', price: 1899, stock: 2 }
    ],
    tags: ['new']
  },
  {
    id: '3',
    name: 'Traditional Lehenga Choli',
    slug: 'traditional-lehenga-choli',
    price: 4999,
    compareAtPrice: 6999,
    images: [
      {
        url: 'https://placehold.co/600x800/fef3c7/d97706?text=Lehenga+Choli',
        altText: 'Traditional Lehenga Choli'
      }
    ],
    category: { name: 'Lehengas', slug: 'lehengas' },
    averageRating: 4.8,
    reviewCount: 35,
    variants: [
      { id: '3-1', color: 'Gold', size: 'S', price: 4999, stock: 1 }
    ],
    tags: ['bestseller']
  },
  {
    id: '9',
    name: 'Bridal Silk Saree',
    slug: 'bridal-silk-saree',
    price: 5499,
    compareAtPrice: 7999,
    images: [
      {
        url: 'https://placehold.co/600x800/fee2e2/dc2626?text=Bridal+Saree',
        altText: 'Bridal Silk Saree'
      }
    ],
    category: { name: 'Sarees', slug: 'sarees' },
    averageRating: 4.9,
    reviewCount: 42,
    variants: [
      { id: '9-1', color: 'Red', size: 'Free Size', price: 5499, stock: 3 }
    ],
    tags: ['new', 'bestseller']
  },
  {
    id: '10',
    name: 'Casual Palazzo Set',
    slug: 'casual-palazzo-set',
    price: 1299,
    compareAtPrice: 1799,
    images: [
      {
        url: 'https://placehold.co/600x800/dbeafe/2563eb?text=Palazzo+Set',
        altText: 'Casual Palazzo Set'
      }
    ],
    category: { name: 'Suits', slug: 'suits' },
    averageRating: 4.3,
    reviewCount: 28,
    variants: [
      { id: '10-1', color: 'Blue', size: 'M', price: 1299, stock: 8 }
    ],
    tags: ['new']
  }
];

const ProductDetailPage = () => {
  const params = useParams();
  const slug = params.slug as string;
  
  const [product, setProduct] = useState(sampleProduct);
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

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

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: `${product.id}-${selectedVariant.id}-${Date.now()}-${i}`,
        name: product.name,
        image: product.images[0]?.url || '/placeholder-product.jpg',
        price: selectedVariant.price || product.price,
        variant: {
          color: selectedVariant.color || '',
          size: selectedVariant.size || '',
        },
        maxQuantity: selectedVariant.stock,
      });
    }
    setQuantity(1);
  };

  const handleWishlistToggle = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        image: product.images[0]?.url || '/placeholder-product.jpg',
        price: product.price,
        originalPrice: product.compareAtPrice,
        slug: product.slug,
        inStock: selectedVariant.stock > 0,
        rating: product.averageRating,
      });
    }
  };

  const handleBuyNow = async () => {
    setLoading(true);
    
    try {
      // Add to cart
      for (let i = 0; i < quantity; i++) {
        addToCart({
          id: `${product.id}-${selectedVariant.id}-${Date.now()}-${i}`,
          name: product.name,
          image: product.images[0]?.url || '/placeholder-product.jpg',
          price: selectedVariant.price || product.price,
          variant: {
            color: selectedVariant.color || '',
            size: selectedVariant.size || '',
          },
          maxQuantity: selectedVariant.stock,
        });
      }

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirect to checkout (for now, redirect to cart)
      // In a real app, you would redirect to a checkout page
      window.location.href = '/cart?checkout=true';
      
    } catch (error) {
      console.error('Buy Now error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-primary-gold">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary-gold">Products</Link>
          <span>/</span>
          <Link href={`/products?category=${product.category.slug}`} className="hover:text-primary-gold">
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8 mb-12">
          {/* Product Images - Sticky */}
          <div className="lg:w-1/2">
            <div className="lg:sticky lg:top-8">
              <div className="flex gap-3">
                {/* Thumbnail Images - Left Side */}
                <div className="flex flex-col space-y-2 w-16">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-16 h-16 overflow-hidden border-2 rounded-lg transition-all hover:shadow-md ${
                        index === selectedImageIndex 
                          ? 'border-blue-500 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={image.url}
                        alt={image.altText || `${product.name} view ${index + 1}`}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
                
                {/* Main Image */}
                <div className="flex-1 relative h-96 lg:h-[500px] overflow-hidden bg-gray-50 rounded-lg group">
                  <Image
                    src={product.images[selectedImageIndex]?.url || '/placeholder-product.jpg'}
                    alt={product.images[selectedImageIndex]?.altText || product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                  
                  {/* Special Price Badge */}
                  {discountPercentage > 0 && (
                    <div className="absolute top-4 left-4 z-10">
                      <div className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-lg">
                        <span>{discountPercentage}% OFF</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Image Navigation Arrows */}
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={() => setSelectedImageIndex(prev => prev === 0 ? product.images.length - 1 : prev - 1)}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setSelectedImageIndex(prev => prev === product.images.length - 1 ? 0 : prev + 1)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Product Info - Scrollable */}
          <div className="lg:w-1/2">
            <div className="space-y-4">
            {/* Brand & Category */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">AVNERA</p>
                <p className="text-sm text-blue-600 font-medium">{product.category.name}</p>
              </div>
              {product.tags?.includes('bestseller') && (
                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                  Bestseller
                </span>
              )}
            </div>
            
            {/* Title */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
              {/* Rating */}
              {product.averageRating && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center bg-green-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    <span>{product.averageRating}</span>
                    <Star className="w-3 h-3 ml-1 fill-current" />
                  </div>
                  <span className="text-xs text-gray-600">
                    ({product.reviewCount?.toLocaleString()} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center space-x-3 mb-1">
              {product.compareAtPrice && (
                <span className="text-base text-gray-500 line-through">
                  {getCurrencySymbol()}{product.compareAtPrice.toLocaleString()}
                </span>
              )}
              <span className="text-2xl font-bold text-gray-900">
                {getCurrencySymbol()}{(selectedVariant.price || product.price).toLocaleString()}
              </span>
              {discountPercentage > 0 && (
                <span className="bg-green-100 text-green-800 px-2 py-1 text-xs rounded-full font-medium">
                  {discountPercentage}% off
                </span>
              )}
              </div>
              <p className="text-xs text-gray-600">Inclusive of all taxes</p>
            </div>

            {/* Color Selection */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <span className="text-sm font-medium text-gray-700 mr-2">Color:</span>
                <span className="text-sm text-gray-900">{selectedVariant.color}</span>
              </div>
              <div className="flex space-x-2">
                {[...new Set(product.variants.map(v => v.color))].map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedVariant(product.variants.find(v => v.color === color) || product.variants[0])}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedVariant.color === color
                        ? 'border-black scale-110'
                        : 'border-gray-300 hover:border-gray-400'
                    } ${color === 'Black' ? 'bg-black' : color === 'Blue' ? 'bg-blue-500' : color === 'Red' ? 'bg-red-500' : 'bg-green-500'}`}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <span className="text-sm font-medium text-gray-700 mr-2">Size:</span>
                <span className="text-sm text-gray-900">{selectedVariant.size}</span>
              </div>
              <div className="flex space-x-2">
                {[...new Set(product.variants.map(v => v.size))].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedVariant(product.variants.find(v => v.size === size) || product.variants[0])}
                    className={`px-3 py-1.5 border rounded-md transition-colors text-sm ${
                      selectedVariant.size === size
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Key Details */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <span className="text-sm text-gray-600">Fabric</span>
                <p className="font-medium text-gray-900">Pure Silk</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Care</span>
                <p className="font-medium text-gray-900">Dry Clean Only</p>
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2 uppercase tracking-wider">QUANTITY</p>
              <div className="flex items-center space-x-3">
                <div className="flex items-center border border-gray-300">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors text-lg font-medium"
                  >
                    -
                  </button>
                  <span className="w-16 h-12 flex items-center justify-center text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(selectedVariant.stock, quantity + 1))}
                    disabled={quantity >= selectedVariant.stock}
                    className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              {/* Stock Status */}
              <div className="flex items-center space-x-2">
                {selectedVariant.stock > 0 ? (
                  <>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 font-medium">In Stock</span>
                    {selectedVariant.stock <= 5 && (
                      <span className="text-orange-600 text-sm">
                        (Only {selectedVariant.stock} left!)
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-red-600 font-medium">Out of Stock</span>
                  </>
                )}
              </div>
              
              {/* Primary Actions */}
              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={selectedVariant.stock === 0 || loading}
                  className={`flex-1 py-4 px-6 font-semibold transition-all rounded-lg ${
                    selectedVariant.stock === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : loading
                      ? 'bg-primary-gold/70 text-white cursor-wait'
                      : 'bg-primary-gold text-black hover:bg-secondary-gold shadow-lg hover:shadow-xl'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Adding...
                    </div>
                  ) : selectedVariant.stock === 0 ? (
                    'OUT OF STOCK'
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5 inline mr-2" />
                      ADD TO CART
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleBuyNow}
                  disabled={selectedVariant.stock === 0 || loading}
                  className={`flex-1 py-4 px-6 font-semibold transition-all rounded-lg flex items-center justify-center gap-2 ${
                    selectedVariant.stock === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : loading
                      ? 'bg-gray-600 text-white cursor-wait'
                      : 'bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl transform hover:scale-105'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>PROCESSING...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      <span>BUY NOW</span>
                    </>
                  )}
                </button>
              </div>
              
              {/* Wishlist Button */}
              <button
                onClick={handleWishlistToggle}
                className={`w-full py-3 px-6 border transition-all rounded-lg flex items-center justify-center gap-2 ${
                  isInWishlist(product.id)
                    ? 'border-red-300 text-red-600 bg-red-50 hover:bg-red-100'
                    : 'border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                <span className="font-medium">ADD TO WISHLIST</span>
              </button>
              
              {/* Delivery & Services */}
              <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <Truck className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Free Delivery</p>
                    <p className="text-sm text-gray-600">Order above ₹999</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <RotateCcw className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Easy Returns</p>
                    <p className="text-sm text-gray-600">7 days return policy</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">Secure Payment</p>
                    <p className="text-sm text-gray-600">100% secure transactions</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bank Offers */}
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
              <h4 className="flex items-center font-bold text-blue-900 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 text-sm font-bold">%</span>
                </div>
                Available Offers
              </h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Bank Offer: 10% off on HDFC Bank Credit Cards</p>
                    <p className="text-xs text-blue-700">Valid on minimum purchase of ₹2,000</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Special Price: Get extra 5% off</p>
                    <p className="text-xs text-blue-700">Price inclusive of discount</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">EMI starting from ₹{Math.round((selectedVariant.price || product.price) / 12)}/month</p>
                    <p className="text-xs text-blue-700">No cost EMI available</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Product Description */}
            <div className="mt-8 bg-gray-50 rounded-xl p-6">
              <h4 className="font-bold text-gray-900 mb-4">Product Description</h4>
              <p className="text-gray-700 leading-relaxed mb-4">{product.description}</p>
              
              {/* Product Features */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Key Features</h5>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Material & Care</h5>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-900">Material:</span>
                      <span className="text-sm text-gray-700 ml-2">{product.material}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-900">Care:</span>
                      <span className="text-sm text-gray-700 ml-2">{product.careInstructions}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews */}
        <div className="border-t border-gray-200 pt-12 mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-green-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold">
                <span>{product.averageRating}</span>
                <Star className="w-4 h-4 ml-1 fill-current" />
              </div>
              <span className="text-sm text-gray-600">({product.reviewCount} reviews)</span>
            </div>
          </div>
          
          <div className="space-y-6">
            {product.reviews.map((review) => (
              <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {review.user.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-bold text-gray-900">{review.user.name}</h4>
                      {review.isVerified && (
                        <span className="bg-green-100 text-green-800 px-3 py-1 text-xs rounded-full font-medium">
                          ✓ Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">{review.createdAt}</span>
                    </div>
                    <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>
                    <p className="text-gray-700 leading-relaxed">{review.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Related Products */}
        <div>
          <h2 className="text-2xl font-brand text-charcoal mb-6">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetailPage;
