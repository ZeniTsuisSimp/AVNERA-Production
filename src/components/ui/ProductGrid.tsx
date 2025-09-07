'use client';

import { useState, useEffect } from 'react';
import { Grid, List, Filter, SlidersHorizontal, ArrowUpDown, ChevronDown } from 'lucide-react';
import ProductCard from './ProductCard';

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

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  showFilters?: boolean;
  totalProducts?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onViewChange?: (view: 'grid' | 'list') => void;
  onSortChange?: (sort: string) => void;
  onShowMobileFilters?: () => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading = false,
  showFilters = true,
  totalProducts = 0,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onViewChange,
  onSortChange,
  onShowMobileFilters,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'popularity', label: 'Popularity' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Customer Rating' },
    { value: 'newest', label: 'Newest First' },
    { value: 'discount', label: 'Discount' },
  ];

  const handleViewChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    onViewChange?.(mode);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setShowSortDropdown(false);
    onSortChange?.(sort);
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className={viewMode === 'grid' 
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
      : 'space-y-4'
    }>
      {[...Array(viewMode === 'grid' ? 12 : 6)].map((_, i) => (
        <div key={i} className={viewMode === 'grid' 
          ? 'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse'
          : 'flex bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse'
        }>
          {viewMode === 'grid' ? (
            <>
              <div className="aspect-[3/4] bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
                <div className="h-6 bg-gray-200 rounded w-1/3" />
                <div className="h-8 bg-gray-200 rounded" />
              </div>
            </>
          ) : (
            <>
              <div className="w-48 h-48 bg-gray-200" />
              <div className="flex-1 p-4 space-y-3">
                <div className="h-3 bg-gray-200 rounded w-1/4" />
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-6 bg-gray-200 rounded w-1/3" />
                <div className="h-8 bg-gray-200 rounded w-1/4" />
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="w-full">
        {/* Toolbar Skeleton */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
          <div className="flex items-center space-x-4">
            <div className="h-8 bg-gray-200 rounded w-32 animate-pulse" />
            <div className="h-8 bg-gray-200 rounded w-16 animate-pulse" />
          </div>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          {/* Results count and mobile filter button */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="text-sm text-gray-700">
                <span className="font-bold text-gray-900 text-lg">{products.length}</span>
                <span className="text-gray-600 mx-1">of</span>
                <span className="font-bold text-gray-900 text-lg">{totalProducts.toLocaleString()}</span>
                <span className="text-gray-600 ml-1">products</span>
              </div>
            </div>
            
            {/* Mobile Filter Button */}
            <button
              onClick={onShowMobileFilters}
              className="lg:hidden flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl text-sm font-semibold text-blue-700 hover:from-blue-100 hover:to-purple-100 hover:border-blue-300 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center space-x-2 px-5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 min-w-[180px] justify-between shadow-sm hover:shadow-md transform hover:scale-105"
              >
                <div className="flex items-center space-x-2">
                  <ArrowUpDown className="w-4 h-4 text-gray-500" />
                  <span>Sort: {sortOptions.find(opt => opt.value === sortBy)?.label}</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 text-gray-500 ${showSortDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showSortDropdown && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-2xl z-20 overflow-hidden backdrop-blur-sm bg-white/95">
                  <div className="py-2">
                    {sortOptions.map((option, index) => (
                      <button
                        key={option.value}
                        onClick={() => handleSortChange(option.value)}
                        className={`w-full text-left px-5 py-3 text-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 transform hover:scale-105 hover:translate-x-1 ${
                          sortBy === option.value 
                            ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-semibold border-l-4 border-blue-500' 
                            : 'text-gray-700 hover:text-gray-900'
                        }`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option.label}</span>
                          {sortBy === option.value && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 border border-gray-200 rounded-xl overflow-hidden p-1">
              <button
                onClick={() => handleViewChange('grid')}
                className={`p-2.5 transition-all duration-200 rounded-lg transform hover:scale-105 ${
                  viewMode === 'grid'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'bg-transparent text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleViewChange('list')}
                className={`p-2.5 transition-all duration-200 rounded-lg transform hover:scale-105 ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'bg-transparent text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* No products message */}
      {products.length === 0 && !loading && (
        <div className="text-center py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-2xl border border-gray-200 shadow-lg">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full animate-pulse" />
            <div className="relative w-full h-full flex items-center justify-center">
              <Filter className="w-16 h-16 text-gray-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">No products found</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">We couldn&apos;t find any products matching your criteria. Try adjusting your filters or search terms.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200 rounded-full text-sm font-medium hover:from-blue-100 hover:to-purple-100 transition-all duration-200 transform hover:scale-105">
              Clear filters
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 rounded-full text-sm font-medium hover:from-green-100 hover:to-emerald-100 transition-all duration-200 transform hover:scale-105">
              Browse all categories
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-orange-50 to-yellow-50 text-orange-700 border border-orange-200 rounded-full text-sm font-medium hover:from-orange-100 hover:to-yellow-100 transition-all duration-200 transform hover:scale-105">
              Reset search
            </button>
          </div>
        </div>
      )}

      {/* Product Grid */}
      {products.length > 0 && (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
            : 'space-y-4'
        }>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              variant={viewMode}
              showQuickAdd={true}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="mt-12 flex justify-center">
          <nav className="flex items-center space-x-2 bg-white border border-gray-200 rounded-2xl p-3 shadow-lg">
            {/* Previous */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 transform hover:scale-105 ${
                currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 hover:shadow-sm'
              }`}
            >
              Previous
            </button>

            {/* Page Numbers */}
            {(() => {
              const pages = [];
              const maxVisible = 5;
              let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        const end = Math.min(totalPages, start + maxVisible - 1);
              
              if (end - start + 1 < maxVisible) {
                start = Math.max(1, end - maxVisible + 1);
              }

              for (let i = start; i <= end; i++) {
                pages.push(
                  <button
                    key={i}
                    onClick={() => onPageChange(i)}
                    className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 transform hover:scale-110 ${
                      currentPage === i
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 hover:shadow-sm'
                    }`}
                  >
                    {i}
                  </button>
                );
              }
              
              return pages;
            })()}

            {/* Next */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 transform hover:scale-105 ${
                currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 hover:shadow-sm'
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {/* Results Summary */}
      {products.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-600">
          Showing {((currentPage - 1) * 12) + 1} to {Math.min(currentPage * 12, totalProducts)} of {totalProducts.toLocaleString()} results
        </div>
      )}

      {/* Click outside to close sort dropdown */}
      {showSortDropdown && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowSortDropdown(false)}
        />
      )}
    </div>
  );
};

export default ProductGrid;