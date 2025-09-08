const mongoose = require('mongoose')

const cartItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  size: String,
  color: String,
  addedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Compound index to ensure one item per user-product-variant combination
cartItemSchema.index({ user: 1, product: 1, size: 1, color: 1 }, { unique: true })

// Auto-populate product details
cartItemSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'product',
    select: 'name price image slug stock status'
  })
  next()
})

module.exports = mongoose.model('CartItem', cartItemSchema)