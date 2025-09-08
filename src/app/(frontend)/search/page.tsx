'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search as SearchIcon } from 'lucide-react';
import Header from '@/components/layout/Header';
import ProductGrid from '@/components/ui/ProductGrid';
import ProductFilters from '@/components/ui/ProductFilters';

// Define the Product type
type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: { url: string; altText: string }[];
  category: { name: string; slug: string };
  averageRating: number;
  reviewCount: number;
  variants: { id: string; color: string; size: string; price: number; stock: number }[];
  tags: string[];
};

// Sample data - In a real app, this would come from your search API
const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Elegant Silk Saree',
    slug: 'elegant-silk-saree',
    price: 2999,
    compareAtPrice: 3999,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        altText: 'Elegant Silk Saree'
      }
    ],
    category: { name: 'Sarees', slug: 'sarees' },
    averageRating: 4.5,
    reviewCount: 24,
    variants: [
      { id: '1-1', color: 'Red', size: 'Free Size', price: 2999, stock: 5 },
      { id: '1-2', color: 'Blue', size: 'Free Size', price: 2999, stock: 3 }
    ],
    tags: ['new', 'bestseller', 'silk', 'saree', 'traditional']
  },
  {
    id: '2',
    name: 'Designer Kurti Set',
    slug: 'designer-kurti-set',
    price: 1899,
    compareAtPrice: 2499,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        altText: 'Designer Kurti Set'
      }
    ],
    category: { name: 'Kurtis', slug: 'kurtis' },
    averageRating: 4.2,
    reviewCount: 18,
    variants: [
      { id: '2-1', color: 'Pink', size: 'S', price: 1899, stock: 2 },
      { id: '2-2', color: 'Pink', size: 'M', price: 1899, stock: 4 }
    ],
    tags: ['new', 'kurti', 'designer', 'casual']
  }
];

const sampleCategories = [
  { id: '1', name: 'Sarees', slug: 'sarees', count: 45 },
  { id: '2', name: 'Kurtis', slug: 'kurtis', count: 32 },
  { id: '3', name: 'Lehengas', slug: 'lehengas', count: 28 },
  { id: '4', name: 'Gowns', slug: 'gowns', count: 15 },
  { id: '5', name: 'Suits', slug: 'suits', count: 22 }
];

const SearchPageContent = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState(query);

  const [filters, setFilters] = useState({
    categories: [] as string[],
    colors: [] as string[],
    sizes: [] as string[],
    priceMin: 0,
    priceMax: 10000,
    inStock: false,
    onSale: false,
  });

  // Get available filter options
  const availableColors = [...new Set(
    sampleProducts.flatMap(p => p.variants?.map(v => v.color).filter(Boolean) || [])
  )].sort();

  const availableSizes = [...new Set(
    sampleProducts.flatMap(p => p.variants?.map(v => v.size).filter(Boolean) || [])
  )].sort();

  const priceRange = {
    min: Math.min(...sampleProducts.map(p => p.price)),
    max: Math.max(...sampleProducts.map(p => p.price))
  };

  // Search and filter products
  useEffect(() => {
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      let filteredProducts = [...sampleProducts];

      // Search filter
      if (query.trim()) {
        const searchTerm = query.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(searchTerm) ||
          p.category.name.toLowerCase().includes(searchTerm) ||
          p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }

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
      setLoading(false);
    }, 500);
  }, [query, filters]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      categories: [] as string[],
      colors: [] as string[],
      sizes: [] as string[],
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
    let sortedProducts = [...products];

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
        // Keep original order for relevance
        break;
    }

    setProducts(sortedProducts);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // In a real app, you would update the URL
      window.history.pushState({}, '', `/search?q=${encodeURIComponent(searchQuery)}`);
      // The useEffect will handle the search
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <span>Home</span>
          <span>/</span>
          <span className="text-gray-900">Search Results</span>
          {query && (
            <>
              <span>/</span>
              <span className="text-gray-900">&quot;{query}&quot;</span>
            </>
          )}
        </nav>

        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-brand text-charcoal mb-4">
            {query ? `Search Results for &quot;${query}&quot;` : 'Search Products'}
          </h1>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-xl">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, categories, or styles..."
                className="w-full px-4 py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent outline-none"
              />
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-gold text-white px-4 py-1.5 rounded-md hover:bg-secondary-gold transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Search Stats */}
          {query && (
            <div className="mt-4 text-gray-600">
              {loading ? (
                <span>Searching...</span>
              ) : (
                <span>
                  Found {totalProducts} result{totalProducts !== 1 ? 's' : ''} 
                  {totalProducts > 0 && ` for "${query}"`}
                </span>
              )}
            </div>
          )}
        </div>

        {/* No Query State */}
        {!query && !loading && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
              <SearchIcon className="w-full h-full" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Start Your Search</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Enter keywords above to search for products, categories, or styles you&apos;re looking for.
            </p>
            
            {/* Popular Searches */}
            <div className="max-w-2xl mx-auto">
              <p className="text-sm text-gray-500 mb-4">Popular searches:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['saree', 'kurti', 'lehenga', 'silk', 'designer', 'wedding'].map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchQuery(term);
                      window.history.pushState({}, '', `/search?q=${encodeURIComponent(term)}`);
                    }}
                    className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:border-primary-gold hover:text-primary-gold transition-colors capitalize"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {query && (
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
              <div className="fixed inset-0 z-50 lg:hidden">
                <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
                <div className="absolute inset-y-0 left-0 w-80 bg-white shadow-xl">
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
            )}

            {/* Products Grid */}
            <div className="flex-1">
              {/* No Results */}
              {!loading && query && products.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
                    <SearchIcon className="w-full h-full" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No results found for &quot;{query}&quot;
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Try searching with different keywords or browse our categories
                  </p>
                  
                  {/* Search Suggestions */}
                  <div className="max-w-md mx-auto">
                    <p className="text-sm text-gray-600 mb-3">Try searching for:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {['saree', 'kurti', 'lehenga', 'designer', 'silk'].map((term) => (
                        <button
                          key={term}
                          onClick={() => {
                            setSearchQuery(term);
                            window.history.pushState({}, '', `/search?q=${encodeURIComponent(term)}`);
                          }}
                          className="px-3 py-1 bg-primary-gold text-white rounded-full text-sm hover:bg-secondary-gold transition-colors capitalize"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Results Grid */}
              {(products.length > 0 || loading) && (
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
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const SearchPage = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <SearchPageContent />
  </Suspense>
);

export default SearchPage;