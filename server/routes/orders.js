const express = require('express')
const Order = require('../models/Order')
const CartItem = require('../models/Cart')
const Product = require('../models/Product')
const auth = require('../middleware/auth')

const router = express.Router()

// Get user's orders
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query

    const filter = { user: req.user.userId }
    if (status) filter.status = status

    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    const orders = await Order.find(filter)
      .populate('items.product', 'name image slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Order.countDocuments(filter)

    res.json({
      success: true,
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    console.error('Get orders error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    })
  }
})

// Get single order
router.get('/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.user.userId
    }).populate('items.product', 'name image slug')

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }

    res.json({
      success: true,
      order
    })
  } catch (error) {
    console.error('Get order error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    })
  }
})

// Create new order
router.post('/', auth, async (req, res) => {
  try {
    const {
      paymentMethod,
      shippingAddress,
      billingAddress,
      paymentDetails
    } = req.body

    // Get user's cart items
    const cartItems = await CartItem.find({ user: req.user.userId })
      .populate('product')

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      })
    }

    // Verify stock availability and calculate totals
    let subtotal = 0
    const orderItems = []

    for (const cartItem of cartItems) {
      const product = cartItem.product

      if (!product || product.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: `Product ${product?.name || 'Unknown'} is no longer available`
        })
      }

      if (product.stock < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} ${product.name} available in stock`
        })
      }

      const itemTotal = product.price * cartItem.quantity
      subtotal += itemTotal

      orderItems.push({
        product: product._id,
        productSnapshot: {
          name: product.name,
          price: product.price,
          image: product.images?.[0]?.url || product.image,
          sku: product.sku
        },
        quantity: cartItem.quantity,
        price: product.price,
        size: cartItem.size,
        color: cartItem.color,
        total: itemTotal
      })
    }

    // Calculate additional charges
    const tax = Math.round(subtotal * 0.18) // 18% GST
    const shipping = subtotal >= 999 ? 0 : 99
    const total = subtotal + tax + shipping

    // Create order
    const order = new Order({
      user: req.user.userId,
      items: orderItems,
      paymentMethod,
      paymentDetails,
      pricing: {
        subtotal,
        tax,
        shipping,
        discount: 0,
        total
      },
      shippingAddress,
      billingAddress: billingAddress || shippingAddress
    })

    await order.save()

    // Update product stock
    for (const cartItem of cartItems) {
      await Product.findByIdAndUpdate(
        cartItem.product._id,
        { $inc: { stock: -cartItem.quantity } }
      )
    }

    // Clear cart
    await CartItem.deleteMany({ user: req.user.userId })

    // Populate the order for response
    await order.populate('items.product', 'name image slug')

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    })
  } catch (error) {
    console.error('Create order error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    })
  }
})

// Update order status (admin only - simplified for now)
router.put('/:orderId/status', auth, async (req, res) => {
  try {
    const { status } = req.body
    const { orderId } = req.params

    const order = await Order.findOneAndUpdate(
      { _id: orderId, user: req.user.userId },
      { status },
      { new: true }
    )

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }

    res.json({
      success: true,
      message: 'Order status updated',
      order
    })
  } catch (error) {
    console.error('Update order status error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    })
  }
})

module.exports = router