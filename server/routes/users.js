const express = require('express')
const User = require('../models/User')
const auth = require('../middleware/auth')
const { body, validationResult } = require('express-validator')

const router = express.Router()

// Get user addresses
router.get('/addresses', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.json({
      success: true,
      addresses: user.addresses
    })
  } catch (error) {
    console.error('Get addresses error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch addresses',
      error: error.message
    })
  }
})

// Add new address
router.post('/addresses', auth, [
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 }),
  body('addressLine1').trim().isLength({ min: 1 }),
  body('city').trim().isLength({ min: 1 }),
  body('state').trim().isLength({ min: 1 }),
  body('postalCode').trim().isLength({ min: 1 }),
  body('country').trim().isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    const addressData = req.body

    // If this is set as default, unset other default addresses
    if (addressData.isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false
      })
    }

    user.addresses.push(addressData)
    await user.save()

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      address: user.addresses[user.addresses.length - 1]
    })
  } catch (error) {
    console.error('Add address error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to add address',
      error: error.message
    })
  }
})

// Update address
router.put('/addresses/:addressId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    const address = user.addresses.id(req.params.addressId)
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      })
    }

    const updateData = req.body

    // If this is set as default, unset other default addresses
    if (updateData.isDefault) {
      user.addresses.forEach(addr => {
        if (addr._id.toString() !== req.params.addressId) {
          addr.isDefault = false
        }
      })
    }

    Object.assign(address, updateData)
    await user.save()

    res.json({
      success: true,
      message: 'Address updated successfully',
      address
    })
  } catch (error) {
    console.error('Update address error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update address',
      error: error.message
    })
  }
})

// Delete address
router.delete('/addresses/:addressId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    const address = user.addresses.id(req.params.addressId)
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      })
    }

    if (address.isDefault && user.addresses.length > 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete default address. Set another address as default first.'
      })
    }

    user.addresses.pull(req.params.addressId)
    await user.save()

    res.json({
      success: true,
      message: 'Address deleted successfully'
    })
  } catch (error) {
    console.error('Delete address error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete address',
      error: error.message
    })
  }
})

module.exports = router