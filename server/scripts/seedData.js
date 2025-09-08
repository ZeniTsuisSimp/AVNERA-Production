const mongoose = require('mongoose')
const Product = require('../models/Product')
require('dotenv').config()

const sampleProducts = [
  {
    name: 'Elegant Silk Saree',
    slug: 'elegant-silk-saree',
    description: 'Experience the epitome of elegance with our handcrafted silk saree. This exquisite piece features intricate zari work and traditional motifs.',
    shortDescription: 'Handcrafted silk saree with zari work',
    price: 2999,
    compareAtPrice: 3999,
    category: 'sarees',
    brand: 'Avnera',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        altText: 'Elegant Silk Saree',
        isPrimary: true
      }
    ],
    variants: [
      { size: 'Free Size', color: 'Red', stock: 5, isActive: true },
      { size: 'Free Size', color: 'Blue', stock: 3, isActive: true },
      { size: 'Free Size', color: 'Green', stock: 2, isActive: true }
    ],
    tags: ['new', 'bestseller', 'silk', 'traditional'],
    features: [
      'Premium silk fabric',
      'Handcrafted zari work',
      'Traditional motifs',
      'Comes with matching blouse piece'
    ],
    material: 'Pure Silk with Zari Work',
    careInstructions: 'Dry clean only. Store in a cool, dry place.',
    stock: 10,
    isFeatured: true,
    status: 'active'
  },
  {
    name: 'Designer Kurti Set',
    slug: 'designer-kurti-set',
    description: 'Trendy kurti set perfect for modern women who appreciate comfort and style.',
    shortDescription: 'Comfortable and stylish kurti set',
    price: 1899,
    compareAtPrice: 2499,
    category: 'kurtis',
    brand: 'Avnera',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        altText: 'Designer Kurti Set',
        isPrimary: true
      }
    ],
    variants: [
      { size: 'S', color: 'Pink', stock: 4, isActive: true },
      { size: 'M', color: 'Pink', stock: 6, isActive: true },
      { size: 'L', color: 'Pink', stock: 3, isActive: true }
    ],
    tags: ['new', 'casual', 'comfortable'],
    features: [
      'Soft cotton fabric',
      'Modern cut',
      'Matching dupatta',
      'Machine washable'
    ],
    material: 'Cotton Blend',
    careInstructions: 'Machine wash cold. Do not bleach.',
    stock: 13,
    isFeatured: true,
    status: 'active'
  },
  {
    name: 'Traditional Lehenga Choli',
    slug: 'traditional-lehenga-choli',
    description: 'Stunning traditional lehenga choli perfect for weddings and festivals.',
    shortDescription: 'Traditional lehenga for special occasions',
    price: 4999,
    compareAtPrice: 6999,
    category: 'lehengas',
    brand: 'Avnera',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        altText: 'Traditional Lehenga Choli',
        isPrimary: true
      }
    ],
    variants: [
      { size: 'S', color: 'Gold', stock: 2, isActive: true },
      { size: 'M', color: 'Gold', stock: 3, isActive: true },
      { size: 'L', color: 'Gold', stock: 1, isActive: true }
    ],
    tags: ['wedding', 'festival', 'traditional', 'bestseller'],
    features: [
      'Heavy embroidery work',
      'Premium fabric',
      'Traditional design',
      'Matching accessories'
    ],
    material: 'Silk with Heavy Embroidery',
    careInstructions: 'Dry clean only. Handle with care.',
    stock: 6,
    isFeatured: true,
    status: 'active'
  },
  {
    name: 'Designer Party Gown',
    slug: 'designer-party-gown',
    description: 'Glamorous party gown that makes you stand out at any event.',
    shortDescription: 'Elegant party gown for special events',
    price: 4299,
    compareAtPrice: 5499,
    category: 'gowns',
    brand: 'Avnera',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        altText: 'Designer Party Gown',
        isPrimary: true
      }
    ],
    variants: [
      { size: 'S', color: 'Black', stock: 3, isActive: true },
      { size: 'M', color: 'Black', stock: 4, isActive: true },
      { size: 'L', color: 'Black', stock: 2, isActive: true }
    ],
    tags: ['party', 'elegant', 'designer'],
    features: [
      'Premium fabric',
      'Designer cut',
      'Perfect fit',
      'Elegant design'
    ],
    material: 'Georgette with Sequin Work',
    careInstructions: 'Dry clean only.',
    stock: 9,
    isFeatured: true,
    status: 'active'
  }
]

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/avnera')
    
    console.log('Connected to MongoDB')
    
    // Clear existing products
    await Product.deleteMany({})
    console.log('Cleared existing products')
    
    // Insert sample products
    await Product.insertMany(sampleProducts)
    console.log(`✅ Inserted ${sampleProducts.length} sample products`)
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  seedProducts()
}

module.exports = { sampleProducts }