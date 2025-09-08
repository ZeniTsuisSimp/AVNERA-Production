const express = require('express')
const Product = require('../models/Product')

const router = express.Router()

// Get all products with filtering
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      brand,
      priceMin,
      priceMax,
      search,
      featured,
      inStock,
      onSale,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query

    // Build filter object
    const filter = { status: 'active' }

    if (category) filter.category = category
    if (brand) filter.brand = brand
    if (featured === 'true') filter.isFeatured = true
    if (inStock === 'true') filter.stock = { $gt: 0 }
    if (onSale === 'true') filter.compareAtPrice = { $exists: true, $gt: 0 }

    // Price range filter
    if (priceMin || priceMax) {
      filter.price = {}
      if (priceMin) filter.price.$gte = parseFloat(priceMin)
      if (priceMax) filter.price.$lte = parseFloat(priceMax)
    }

    // Search filter
    if (search) {
      filter.$text = { $search: search }
    }

    // Build sort object
    const sort = {}
    if (search) {
      sort.score = { $meta: 'textScore' }
    }
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1

    // Execute query
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean()

    // Get total count for pagination
    const total = await Product.countDocuments(filter)

    res.json({
      success: true,
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    console.error('Get products error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    })
  }
})

// Get single product by slug
router.get('/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ 
      slug: req.params.slug,
      status: 'active'
    }).lean()

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }

    res.json({
      success: true,
      product
    })
  } catch (error) {
    console.error('Get product error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    })
  }
})

// Get categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category', { status: 'active' })
    
    res.json({
      success: true,
      categories: categories.map(cat => ({
        id: cat,
        name: cat.charAt(0).toUpperCase() + cat.slice(1),
        slug: cat
      }))
    })
  } catch (error) {
    console.error('Get categories error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    })
  }
})

// Get brands
router.get('/meta/brands', async (req, res) => {
  try {
    const brands = await Product.distinct('brand', { status: 'active' })
    
    res.json({
      success: true,
      brands
    })
  } catch (error) {
    console.error('Get brands error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch brands',
      error: error.message
    })
  }
})

module.exports = router