import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Star } from 'lucide-react'
import { useCart } from '../../contexts/CartContext'
import { useToast } from '../../contexts/ToastContext'

interface Product {
  _id: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number
  image: string
  category: string
  brand?: string
  inStock: boolean
  rating?: number
  reviewCount?: number
}

interface ProductCardProps {
  product: Product
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart()
  const { addToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const discountPercentage = product.compareAtPrice 
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!product.inStock) {
      addToast({
        type: 'error',
        title: 'Out of Stock',
        message: 'This product is currently out of stock'
      })
      return
    }

    setIsLoading(true)
    
    try {
      await addItem({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.image
      })
      
      addToast({
        type: 'success',
        title: 'Added to Cart',
        message: `${product.name} has been added to your cart`
      })
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to Add',
        message: error instanceof Error ? error.message : 'Failed to add item to cart'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
      <Link to={`/products/${product.slug}`}>
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <div className="absolute top-2 left-2">
              <span className="bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
                {discountPercentage}% OFF
              </span>
            </div>
          )}

          {/* Wishlist Button */}
          <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
            <Heart className="w-4 h-4 text-gray-400 hover:text-red-500" />
          </button>

          {/* Out of Stock Overlay */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold bg-black/75 px-3 py-1 rounded">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link to={`/products/${product.slug}`}>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            {product.category}
          </p>
          <h3 className="font-semibold text-gray-900 hover:text-primary-gold transition-colors mb-2">
            {product.name}
          </h3>
        </Link>
        
        {/* Rating */}
        {product.rating && (
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating!)
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
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-lg font-bold text-gray-900">
            ₹{product.price.toLocaleString()}
          </span>
          {product.compareAtPrice && (
            <span className="text-sm text-gray-500 line-through">
              ₹{product.compareAtPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock || isLoading}
          className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-all ${
            !product.inStock
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : isLoading
              ? 'bg-primary-gold/70 text-black cursor-wait'
              : 'bg-primary-gold text-black hover:bg-secondary-gold'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
              Adding...
            </div>
          ) : !product.inStock ? (
            'Out of Stock'
          ) : (
            <>
              <ShoppingBag className="w-4 h-4 inline mr-2" />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default ProductCard