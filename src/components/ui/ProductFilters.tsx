'use client';

import { useState } from 'react';
import { X, ChevronDown, ChevronUp, Filter, RotateCcw } from 'lucide-react';

interface FilterOption {
  id: string;
  name: string;
  count?: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  count?: number;
}

interface ProductFiltersProps {
  categories: Category[];
  availableColors: string[];
  availableSizes: string[];
  priceRange: {
    min: number;
    max: number;
  };
  selectedFilters: {
    categories: string[];
    colors: string[];
    sizes: string[];
    priceMin: number;
    priceMax: number;
    inStock: boolean;
    onSale: boolean;
  };
  onFilterChange: (filters: {
    categories: string[];
    colors: string[];
    sizes: string[];
    priceMin: number;
    priceMax: number;
    inStock: boolean;
    onSale: boolean;
  }) => void;
  onClearFilters: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  availableColors,
  availableSizes,
  priceRange,
  selectedFilters,
  onFilterChange,
  onClearFilters,
  isOpen = true,
  onClose,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    colors: true,
    sizes: true,
    availability: true,
    rating: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCategoryChange = (categoryId: string) => {
    const newCategories = selectedFilters.categories.includes(categoryId)
      ? selectedFilters.categories.filter(id => id !== categoryId)
      : [...selectedFilters.categories, categoryId];
    
    onFilterChange({
      ...selectedFilters,
      categories: newCategories,
    });
  };

  const handleColorChange = (color: string) => {
    const newColors = selectedFilters.colors.includes(color)
      ? selectedFilters.colors.filter(c => c !== color)
      : [...selectedFilters.colors, color];
    
    onFilterChange({
      ...selectedFilters,
      colors: newColors,
    });
  };

  const handleSizeChange = (size: string) => {
    const newSizes = selectedFilters.sizes.includes(size)
      ? selectedFilters.sizes.filter(s => s !== size)
      : [...selectedFilters.sizes, size];
    
    onFilterChange({
      ...selectedFilters,
      sizes: newSizes,
    });
  };

  const handlePriceChange = (min: number, max: number) => {
    onFilterChange({
      ...selectedFilters,
      priceMin: min,
      priceMax: max,
    });
  };

  const handleAvailabilityChange = (type: 'inStock' | 'onSale', value: boolean) => {
    onFilterChange({
      ...selectedFilters,
      [type]: value,
    });
  };

  const getActiveFiltersCount = () => {
    return (
      selectedFilters.categories.length +
      selectedFilters.colors.length +
      selectedFilters.sizes.length +
      (selectedFilters.inStock ? 1 : 0) +
      (selectedFilters.onSale ? 1 : 0) +
      (selectedFilters.priceMin > priceRange.min || selectedFilters.priceMax < priceRange.max ? 1 : 0)
    );
  };

  const colorMap: { [key: string]: string } = {
    'Red': 'bg-red-500',
    'Blue': 'bg-blue-500',
    'Green': 'bg-green-500',
    'Yellow': 'bg-yellow-500',
    'Pink': 'bg-pink-500',
    'Purple': 'bg-purple-500',
    'Orange': 'bg-orange-500',
    'Black': 'bg-black',
    'White': 'bg-white border-2 border-gray-300',
    'Gray': 'bg-gray-500',
    'Brown': 'bg-amber-800',
    'Gold': 'bg-yellow-400',
  };

  const FilterSection: React.FC<{
    title: string;
    sectionKey: keyof typeof expandedSections;
    children: React.ReactNode;
    count?: number;
  }> = ({ title, sectionKey, children, count }) => (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex justify-between items-center py-4 px-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <span className="font-medium text-gray-900">{title}</span>
          {count !== undefined && count > 0 && (
            <span className="bg-primary-gold text-black px-2 py-1 rounded-full text-xs font-medium">
              {count}
            </span>
          )}
        </div>
        {expandedSections[sectionKey] ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>
      {expandedSections[sectionKey] && (
        <div className="px-4 pb-4">{children}</div>
      )}
    </div>
  );

  return (
    <div className={`${isOpen ? 'block' : 'hidden'} lg:block bg-white border border-gray-200 rounded-lg shadow-sm`}>
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
          {getActiveFiltersCount() > 0 && (
            <span className="bg-primary-gold text-black px-2 py-1 rounded-full text-xs font-bold">
              {getActiveFiltersCount()}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {getActiveFiltersCount() > 0 && (
            <button
              onClick={onClearFilters}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear All</span>
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {/* Categories */}
        {categories.length > 0 && (
          <FilterSection 
            title="Categories" 
            sectionKey="categories"
            count={selectedFilters.categories.length}
          >
            <div className="space-y-2">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedFilters.categories.includes(category.id)}
                      onChange={() => handleCategoryChange(category.id)}
                      className="w-4 h-4 text-primary-gold border-gray-300 rounded focus:ring-primary-gold"
                    />
                    <span className="text-sm text-gray-700">{category.name}</span>
                  </div>
                  {category.count && (
                    <span className="text-xs text-gray-500">({category.count})</span>
                  )}
                </label>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Price Range */}
        <FilterSection title="Price Range" sectionKey="price">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Min Price</label>
                <input
                  type="number"
                  placeholder="0"
                  value={selectedFilters.priceMin || ''}
                  onChange={(e) => handlePriceChange(parseInt(e.target.value) || priceRange.min, selectedFilters.priceMax)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-gold focus:border-transparent outline-none"
                />
              </div>
              <span className="text-gray-400 text-sm pt-5">to</span>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Max Price</label>
                <input
                  type="number"
                  placeholder={priceRange.max.toString()}
                  value={selectedFilters.priceMax || ''}
                  onChange={(e) => handlePriceChange(selectedFilters.priceMin, parseInt(e.target.value) || priceRange.max)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-gold focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Range: ₹{priceRange.min.toLocaleString()} - ₹{priceRange.max.toLocaleString()}
            </div>
          </div>
        </FilterSection>

        {/* Colors */}
        {availableColors.length > 0 && (
          <FilterSection 
            title="Colors" 
            sectionKey="colors"
            count={selectedFilters.colors.length}
          >
            <div className="grid grid-cols-4 gap-2">
              {availableColors.map((color) => (
                <label key={color} className="flex flex-col items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedFilters.colors.includes(color)}
                    onChange={() => handleColorChange(color)}
                    className="sr-only"
                  />
                  <div className={`w-8 h-8 rounded-full ${colorMap[color] || 'bg-gray-400'} ${
                    selectedFilters.colors.includes(color) 
                      ? 'ring-2 ring-primary-gold ring-offset-2' 
                      : 'group-hover:ring-2 group-hover:ring-gray-300 group-hover:ring-offset-1'
                  } transition-all`} />
                  <span className="text-xs text-gray-600 mt-1 text-center">{color}</span>
                </label>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Sizes */}
        {availableSizes.length > 0 && (
          <FilterSection 
            title="Sizes" 
            sectionKey="sizes"
            count={selectedFilters.sizes.length}
          >
            <div className="grid grid-cols-4 gap-2">
              {availableSizes.map((size) => (
                <label key={size} className="cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFilters.sizes.includes(size)}
                    onChange={() => handleSizeChange(size)}
                    className="sr-only"
                  />
                  <div className={`w-12 h-10 flex items-center justify-center text-sm font-medium border-2 rounded-lg transition-all ${
                    selectedFilters.sizes.includes(size)
                      ? 'border-primary-gold bg-primary-gold text-black'
                      : 'border-gray-300 text-gray-700 hover:border-primary-gold'
                  }`}>
                    {size}
                  </div>
                </label>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Customer Rating */}
        <FilterSection title="Customer Rating" sectionKey="rating">
          <div className="space-y-2">
            {[4, 3, 2, 1].map((rating) => (
              <label key={rating} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary-gold border-gray-300 rounded focus:ring-primary-gold mr-3"
                />
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-sm text-gray-600 ml-2">& Up</span>
                </div>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Availability */}
        <FilterSection title="Availability" sectionKey="availability">
          <div className="space-y-3">
            <label className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={selectedFilters.inStock}
                onChange={(e) => handleAvailabilityChange('inStock', e.target.checked)}
                className="w-4 h-4 text-primary-gold border-gray-300 rounded focus:ring-primary-gold mr-3"
              />
              <span className="text-sm text-gray-700">In Stock</span>
            </label>
            <label className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={selectedFilters.onSale}
                onChange={(e) => handleAvailabilityChange('onSale', e.target.checked)}
                className="w-4 h-4 text-primary-gold border-gray-300 rounded focus:ring-primary-gold mr-3"
              />
              <span className="text-sm text-gray-700">On Sale</span>
            </label>
          </div>
        </FilterSection>
      </div>
    </div>
  );
};

export default ProductFilters;