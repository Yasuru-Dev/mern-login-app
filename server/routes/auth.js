const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists!' })
    }

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user
    const user = new User({ name, email, password: hashedPassword })
    await user.save()

    res.status(201).json({ message: 'User registered successfully!' })

  } catch (err) {
    res.status(500).json({ message: 'Server error!' })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'User not found!' })
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Wrong password!' })
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )

    res.json({ token, message: 'Login successful!' })

  } catch (err) {
    res.status(500).json({ message: 'Server error!' })
  }
})

module.exports = router