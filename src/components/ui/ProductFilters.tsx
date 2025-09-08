import { useState } from 'react'
import { ChevronDown, ChevronUp, Filter } from 'lucide-react'

interface Filters {
  category: string
  priceMin: number
  priceMax: number
  brand: string
  inStock: boolean
  onSale: boolean
}

interface ProductFiltersProps {
  filters: Filters
  onFilterChange: (filters: Filters) => void
}

const ProductFilters: React.FC<ProductFiltersProps> = ({ filters, onFilterChange }) => {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    brand: true,
    availability: true,
  })

  const categories = [
    { id: 'sarees', name: 'Sarees' },
    { id: 'kurtis', name: 'Kurtis' },
    { id: 'lehengas', name: 'Lehengas' },
    { id: 'gowns', name: 'Gowns' },
    { id: 'suits', name: 'Suits' },
  ]

  const brands = [
    'Avnera',
    'Designer Collection',
    'Premium Line',
    'Traditional Craft',
  ]

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleFilterChange = (key: keyof Filters, value: any) => {
    onFilterChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFilterChange({
      category: '',
      priceMin: 0,
      priceMax: 10000,
      brand: '',
      inStock: false,
      onSale: false,
    })
  }

  const FilterSection: React.FC<{
    title: string
    sectionKey: keyof typeof expandedSections
    children: React.ReactNode
  }> = ({ title, sectionKey, children }) => (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex justify-between items-center py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-900">{title}</span>
        {expandedSections[sectionKey] ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>
      {expandedSections[sectionKey] && (
        <div className="pb-4">{children}</div>
      )}
    </div>
  )

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>
        <button
          onClick={clearFilters}
          className="text-sm text-primary-gold hover:text-secondary-gold"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-0">
        {/* Categories */}
        <FilterSection title="Categories" sectionKey="category">
          <div className="space-y-2">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center">
                <input
                  type="radio"
                  name="category"
                  value={category.id}
                  checked={filters.category === category.id}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-4 h-4 text-primary-gold border-gray-300 focus:ring-primary-gold"
                />
                <span className="ml-2 text-sm text-gray-700">{category.name}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Price Range */}
        <FilterSection title="Price Range" sectionKey="price">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.priceMin || ''}
                onChange={(e) => handleFilterChange('priceMin', parseInt(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
              />
              <span className="text-gray-400">to</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.priceMax || ''}
                onChange={(e) => handleFilterChange('priceMax', parseInt(e.target.value) || 10000)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        </FilterSection>

        {/* Brand */}
        <FilterSection title="Brand" sectionKey="brand">
          <div className="space-y-2">
            {brands.map((brand) => (
              <label key={brand} className="flex items-center">
                <input
                  type="radio"
                  name="brand"
                  value={brand}
                  checked={filters.brand === brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                  className="w-4 h-4 text-primary-gold border-gray-300 focus:ring-primary-gold"
                />
                <span className="ml-2 text-sm text-gray-700">{brand}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Availability */}
        <FilterSection title="Availability" sectionKey="availability">
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                className="w-4 h-4 text-primary-gold border-gray-300 rounded focus:ring-primary-gold"
              />
              <span className="ml-2 text-sm text-gray-700">In Stock</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.onSale}
                onChange={(e) => handleFilterChange('onSale', e.target.checked)}
                className="w-4 h-4 text-primary-gold border-gray-300 rounded focus:ring-primary-gold"
              />
              <span className="ml-2 text-sm text-gray-700">On Sale</span>
            </label>
          </div>
        </FilterSection>
      </div>
    </div>
  )
}

export default ProductFilters