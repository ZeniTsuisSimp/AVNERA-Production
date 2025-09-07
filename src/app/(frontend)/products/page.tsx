'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import ProductGrid from '@/components/ui/ProductGrid';
import ProductFilters from '@/components/ui/ProductFilters';

// Fallback data used when API is not available or fails - using UUID format
const fallbackProducts = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Sample Silk Saree',
    slug: 'sample-silk-saree',
    price: 2999,
    compareAtPrice: 3999,
    images: [
      {
        url: 'https://placehold.co/600x800/f1f5f9/64748b?text=Sample+Silk+Saree',
        altText: 'Sample Silk Saree'
      }
    ],
    category: { name: 'Sarees', slug: 'sarees' },
    averageRating: 4.5,
    reviewCount: 24,
    variants: [
      { id: '11111111-1111-1111-1111-111111111111-v1', color: 'Red', size: 'Free Size', price: 2999, stock: 5 }
    ],
    tags: ['sample']
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Sample Kurti Set',
    slug: 'sample-kurti-set',
    price: 1899,
    compareAtPrice: 2499,
    images: [
      {
        url: 'https://placehold.co/600x800/e0f2fe/0369a1?text=Sample+Kurti+Set',
        altText: 'Sample Kurti Set'
      }
    ],
    category: { name: 'Kurtis', slug: 'kurtis' },
    averageRating: 4.2,
    reviewCount: 18,
    variants: [
      { id: '22222222-2222-2222-2222-222222222222-v1', color: 'Pink', size: 'M', price: 1899, stock: 4 }
    ],
    tags: ['sample']
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Sample Lehenga Choli',
    slug: 'sample-lehenga-choli',
    price: 4999,
    compareAtPrice: 6999,
    images: [
      {
        url: 'https://placehold.co/600x800/fef3c7/d97706?text=Sample+Lehenga',
        altText: 'Sample Lehenga Choli'
      }
    ],
    category: { name: 'Lehengas', slug: 'lehengas' },
    averageRating: 4.8,
    reviewCount: 35,
    variants: [
      { id: '33333333-3333-3333-3333-333333333333-v1', color: 'Gold', size: 'M', price: 4999, stock: 2 }
    ],
    tags: ['sample']
  }
];

const sampleCategories = [
  { id: '223e4567-e89b-12d3-a456-426614174001', name: 'Sarees', slug: 'sarees', count: 45 },
  { id: '223e4567-e89b-12d3-a456-426614174002', name: 'Kurtis', slug: 'kurtis', count: 32 },
  { id: '223e4567-e89b-12d3-a456-426614174003', name: 'Lehengas', slug: 'lehengas', count: 28 },
  { id: '223e4567-e89b-12d3-a456-426614174004', name: 'Gowns', slug: 'gowns', count: 15 },
  { id: '223e4567-e89b-12d3-a456-426614174005', name: 'Suits', slug: 'suits', count: 22 }
];

const ProductsPageContent = () => {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    categories: [],
    colors: [],
    sizes: [],
    priceMin: 0,
    priceMax: 10000,
    inStock: false,
    onSale: false,
  });

  // Load products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Try to create sample products first if none exist
        try {
          await fetch('/api/test/create-products', { method: 'POST' });
        } catch {
          // Ignore errors - products might already exist
        }
        
        // Fetch products from API
        const response = await fetch('/api/products');
        console.log('Products API response status:', response.status);
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('Products API result:', result);
        if (result.success && result.data && Array.isArray(result.data)) {
          // Transform API data to match expected format
          const transformedProducts = result.data.map((product: any) => ({
            id: product.id,
            name: product.name,
            slug: product.slug || product.name.toLowerCase().replace(/\s+/g, '-'),
            price: product.price,
            compareAtPrice: product.compare_at_price || null,
            images: [
              {
                url: product.image_url || `https://placehold.co/600x800/f1f5f9/64748b?text=${encodeURIComponent(product.name)}`,
                altText: product.name
              }
            ],
            category: { name: 'Ethnic Wear', slug: 'ethnic-wear' },
            averageRating: 4.5,
            reviewCount: Math.floor(Math.random() * 50) + 10,
            variants: [
              { 
                id: `${product.id}-v1`, 
                color: 'Default', 
                size: 'Free Size', 
                price: product.price, 
                stock: product.stock_quantity || 0 
              }
            ],
            tags: product.is_featured ? ['featured'] : []
          }));
          
          setAllProducts(transformedProducts);
          setProducts(transformedProducts);
          setTotalProducts(transformedProducts.length);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Failed to load products:', error);
        console.error('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : 'No stack trace',
          error
        });
        setError('Failed to load products from database. Using sample data.');
        setAllProducts(fallbackProducts);
        setProducts(fallbackProducts);
        setTotalProducts(fallbackProducts.length);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Get available filter options
  const availableColors = [...new Set(
    allProducts.flatMap(p => p.variants?.map(v => v.color).filter(Boolean) || [])
  )].sort();

  const availableSizes = [...new Set(
    allProducts.flatMap(p => p.variants?.map(v => v.size).filter(Boolean) || [])
  )].sort();

  const priceRange = {
    min: allProducts.length > 0 ? Math.min(...allProducts.map(p => p.price)) : 0,
    max: allProducts.length > 0 ? Math.max(...allProducts.map(p => p.price)) : 10000
  };

  // Filter products based on selected filters
  useEffect(() => {
    if (allProducts.length === 0) return;
    
    let filteredProducts = [...allProducts];

    // Category filter
    if (filters.categories.length > 0) {
      const categoryMap = Object.fromEntries(sampleCategories.map(c => [c.id, c.slug]));
      const selectedSlugs = filters.categories.map(id => categoryMap[id]);
      filteredProducts = filteredProducts.filter(p => 
        selectedSlugs.includes(p.category.slug)
      );
    }

    // Price filter
    filteredProducts = filteredProducts.filter(p => 
      p.price >= filters.priceMin && p.price <= filters.priceMax
    );

    // Color filter
    if (filters.colors.length > 0) {
      filteredProducts = filteredProducts.filter(p =>
        p.variants?.some(v => filters.colors.includes(v.color || ''))
      );
    }

    // Size filter
    if (filters.sizes.length > 0) {
      filteredProducts = filteredProducts.filter(p =>
        p.variants?.some(v => filters.sizes.includes(v.size || ''))
      );
    }

    // Stock filter
    if (filters.inStock) {
      filteredProducts = filteredProducts.filter(p =>
        p.variants?.some(v => v.stock > 0)
      );
    }

    // Sale filter
    if (filters.onSale) {
      filteredProducts = filteredProducts.filter(p => p.compareAtPrice);
    }

    setProducts(filteredProducts);
    setTotalProducts(filteredProducts.length);
    setTotalPages(Math.ceil(filteredProducts.length / 12));
    setCurrentPage(1);
  }, [filters, allProducts]);

  // Initialize filters from URL params
  useEffect(() => {
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const bestsellers = searchParams.get('bestsellers');

    const initialFilters = { ...filters };

    if (category) {
      const categoryObj = sampleCategories.find(c => c.slug === category);
      if (categoryObj) {
        initialFilters.categories = [categoryObj.id];
      }
    }

    if (featured === 'true') {
      // Filter for new/featured items
      const featuredProducts = allProducts.filter(p => p.tags?.includes('featured'));
      setProducts(featuredProducts);
    }

    if (bestsellers === 'true') {
      // Filter for bestseller items  
      const bestsellerProducts = allProducts.filter(p => p.tags?.includes('bestseller'));
      setProducts(bestsellerProducts);
    }

    setFilters(initialFilters);
  }, [searchParams]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      categories: [],
      colors: [],
      sizes: [],
      priceMin: priceRange.min,
      priceMax: priceRange.max,
      inStock: false,
      onSale: false,
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (sort: string) => {
    const sortedProducts = [...products];

    switch (sort) {
      case 'price-low':
        sortedProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sortedProducts.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sortedProducts.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case 'newest':
        sortedProducts.sort((a, b) => a.tags?.includes('new') ? -1 : 1);
        break;
      case 'popularity':
        sortedProducts.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        break;
      default:
        // Keep original order for featured
        break;
    }

    setProducts(sortedProducts);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-primary-gold transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Products</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            All Products 
            <span className="text-lg font-normal text-gray-600 ml-2">
              ({totalProducts.toLocaleString()} items)
            </span>
          </h1>
          <p className="text-gray-600">
            Discover our complete collection of premium fashion
          </p>
          
          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-orange-700">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-8">
              <ProductFilters
                categories={sampleCategories}
                availableColors={availableColors}
                availableSizes={availableSizes}
                priceRange={priceRange}
                selectedFilters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
              />
            </div>
          </div>

          {/* Mobile Filters Overlay */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 lg:hidden overflow-hidden">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
              <div className="absolute inset-y-0 left-0 w-80 bg-white shadow-2xl">
                <div className="h-full overflow-y-auto">
                <ProductFilters
                  categories={sampleCategories}
                  availableColors={availableColors}
                  availableSizes={availableSizes}
                  priceRange={priceRange}
                  selectedFilters={filters}
                  onFilterChange={handleFilterChange}
                  onClearFilters={handleClearFilters}
                  isOpen={true}
                  onClose={() => setShowMobileFilters(false)}
                />
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            <ProductGrid
              products={products}
              loading={loading}
              totalProducts={totalProducts}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onSortChange={handleSortChange}
              onShowMobileFilters={() => setShowMobileFilters(true)}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

const ProductsPage = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <ProductsPageContent />
  </Suspense>
);

export default ProductsPage;
