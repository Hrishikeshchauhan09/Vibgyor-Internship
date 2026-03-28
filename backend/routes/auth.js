const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { verifyAdmin } = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();

// GET /api/auth/users -> list all employees/users (for admin)
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const [users] = await db.query("SELECT user_id, name, email, role, created_at FROM users WHERE role = 'admin' ORDER BY created_at DESC");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users.' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }

    // Check if user exists
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === 'admin' ? 'admin' : 'customer';

    // Insert user
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())',
      [name, email, hashedPassword, userRole]
    );

    res.status(201).json({ message: 'User registered successfully.', userId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful.',
      token,
      user: { id: user.user_id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

module.exports = router;
