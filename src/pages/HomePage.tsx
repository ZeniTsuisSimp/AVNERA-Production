import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/layout/Header'

interface Product {
  _id: string
  name: string
  slug: string
  price: number
  image: string
  category: string
}

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('/api/products?featured=true&limit=6')
      const data = await response.json()
      
      if (data.success) {
        setFeaturedProducts(data.products)
      }
    } catch (error) {
      console.error('Failed to fetch featured products:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <h1 className="brand-font text-6xl md:text-8xl mb-8 text-charcoal">
            AVNERA
          </h1>
          <h2 className="text-2xl md:text-4xl font-light tracking-wide text-charcoal mb-6">
            Craft Meets Couture
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Discover our exclusive collection of premium fashion pieces crafted for the modern connoisseur
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="btn-primary text-lg px-8 py-4"
            >
              Explore Collection
            </Link>
            <Link
              to="/products?featured=true"
              className="btn-secondary text-lg px-8 py-4"
            >
              New Arrivals
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading mb-4 text-charcoal">
              Featured Collection
            </h2>
            <div className="w-16 h-0.5 bg-primary-gold mx-auto"></div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-gray-200 rounded-lg"></div>
                  <div className="pt-4 text-center">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <Link key={product._id} to={`/products/${product.slug}`} className="group">
                  <div className="aspect-[3/4] relative overflow-hidden bg-gray-100 rounded-lg">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="pt-4 text-center">
                    <h3 className="text-lg font-medium mb-2 text-charcoal">{product.name}</h3>
                    <p className="text-gray-600">₹{product.price.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          <div className="text-center mt-16">
            <Link to="/products" className="btn-secondary">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-charcoal text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-heading mb-4">Stay Updated</h2>
          <p className="mb-8 text-gray-300 max-w-lg mx-auto">
            Get notified about new arrivals and exclusive offers
          </p>
          
          <div className="max-w-md mx-auto flex gap-2">
            <input 
              type="email" 
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-primary-gold"
            />
            <button className="px-6 py-3 bg-primary-gold text-charcoal rounded-lg font-semibold hover:bg-secondary-gold transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage