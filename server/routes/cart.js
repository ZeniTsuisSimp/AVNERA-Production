const express = require('express')
const CartItem = require('../models/Cart')
const Product = require('../models/Product')
const auth = require('../middleware/auth')

const router = express.Router()

// Get user's cart
router.get('/', auth, async (req, res) => {
  try {
    const cartItems = await CartItem.find({ user: req.user.userId })
      .populate('product', 'name price image slug stock status')
      .sort({ createdAt: -1 })

    // Filter out items with inactive products
    const activeItems = cartItems.filter(item => 
      item.product && item.product.status === 'active'
    )

    // Calculate totals
    const totalItems = activeItems.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = activeItems.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0
    )

    res.json({
      success: true,
      items: activeItems,
      summary: {
        totalItems,
        totalPrice,
        itemCount: activeItems.length
      }
    })
  } catch (error) {
    console.error('Get cart error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart',
      error: error.message
    })
  }
})

// Add item to cart
router.post('/', auth, async (req, res) => {
  try {
    const { productId, quantity = 1, size, color } = req.body

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      })
    }

    // Check if product exists and is active
    const product = await Product.findOne({ 
      _id: productId, 
      status: 'active' 
    })

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or inactive'
      })
    }

    // Check stock availability
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`
      })
    }

    // Check if item already exists in cart
    const existingItem = await CartItem.findOne({
      user: req.user.userId,
      product: productId,
      size: size || null,
      color: color || null
    })

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity
      
      if (product.stock < newQuantity) {
        return res.status(400).json({
          success: false,
          message: `Cannot add ${quantity} more items. Only ${product.stock - existingItem.quantity} available.`
        })
      }

      existingItem.quantity = newQuantity
      await existingItem.save()
      await existingItem.populate('product', 'name price image slug stock status')

      return res.json({
        success: true,
        message: 'Cart item updated',
        item: existingItem
      })
    }

    // Create new cart item
    const cartItem = new CartItem({
      user: req.user.userId,
      product: productId,
      quantity,
      size,
      color
    })

    await cartItem.save()
    await cartItem.populate('product', 'name price image slug stock status')

    res.status(201).json({
      success: true,
      message: 'Item added to cart',
      item: cartItem
    })
  } catch (error) {
    console.error('Add to cart error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: error.message
    })
  }
})

// Update cart item quantity
router.put('/:itemId', auth, async (req, res) => {
  try {
    const { quantity } = req.body
    const { itemId } = req.params

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quantity'
      })
    }

    const cartItem = await CartItem.findOne({
      _id: itemId,
      user: req.user.userId
    }).populate('product')

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      })
    }

    // Check stock availability
    if (cartItem.product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${cartItem.product.stock} items available in stock`
      })
    }

    cartItem.quantity = quantity
    await cartItem.save()

    res.json({
      success: true,
      message: 'Cart item updated',
      item: cartItem
    })
  } catch (error) {
    console.error('Update cart error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update cart item',
      error: error.message
    })
  }
})

// Remove cart item
router.delete('/:itemId', auth, async (req, res) => {
  try {
    const { itemId } = req.params

    const result = await CartItem.findOneAndDelete({
      _id: itemId,
      user: req.user.userId
    })

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      })
    }

    res.json({
      success: true,
      message: 'Item removed from cart'
    })
  } catch (error) {
    console.error('Remove cart item error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to remove cart item',
      error: error.message
    })
  }
})

// Clear cart
router.delete('/', auth, async (req, res) => {
  try {
    await CartItem.deleteMany({ user: req.user.userId })

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    })
  } catch (error) {
    console.error('Clear cart error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message
    })
  }
})

module.exports = router