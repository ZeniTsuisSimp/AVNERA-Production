const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: String,
  price: {
    type: Number,
    required: true,
    min: 0
  },
  compareAtPrice: {
    type: Number,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['sarees', 'kurtis', 'lehengas', 'gowns', 'suits', 'accessories']
  },
  brand: {
    type: String,
    default: 'Avnera'
  },
  images: [{
    url: { type: String, required: true },
    altText: String,
    isPrimary: { type: Boolean, default: false }
  }],
  variants: [{
    size: String,
    color: String,
    sku: String,
    price: Number,
    stock: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  }],
  tags: [String],
  features: [String],
  material: String,
  careInstructions: String,
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    weight: Number
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 5
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft', 'archived'],
    default: 'active'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isDigital: {
    type: Boolean,
    default: false
  },
  requiresShipping: {
    type: Boolean,
    default: true
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  sales: {
    totalSold: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 }
  },
  publishedAt: Date
}, {
  timestamps: true
})

// Indexes for better performance
productSchema.index({ slug: 1 })
productSchema.index({ category: 1 })
productSchema.index({ status: 1 })
productSchema.index({ isFeatured: 1 })
productSchema.index({ price: 1 })
productSchema.index({ 'rating.average': -1 })
productSchema.index({ createdAt: -1 })

// Text search index
productSchema.index({
  name: 'text',
  description: 'text',
  tags: 'text'
})

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.compareAtPrice && this.compareAtPrice > this.price) {
    return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100)
  }
  return 0
})

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.stock === 0) return 'out-of-stock'
  if (this.stock <= this.lowStockThreshold) return 'low-stock'
  return 'in-stock'
})

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true })

module.exports = mongoose.model('Product', productSchema)