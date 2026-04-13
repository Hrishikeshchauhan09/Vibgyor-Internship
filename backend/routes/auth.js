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
    const [users] = await db.query("SELECT user_id, name, email, role, account_status, created_at FROM users WHERE role IN ('admin', 'employee') ORDER BY created_at DESC");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users.' });
  }
});

// POST /api/auth/register (PUBLIC - ONLY CREATES CUSTOMERS)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

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
    const userRole = 'customer';

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

// POST /api/auth/add-staff (ADMIN ONLY)
router.post('/add-staff', verifyAdmin, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(409).json({ message: 'User already exists.' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())',
      [name, email, hashedPassword, 'employee']
    );
    res.status(201).json({ message: 'Staff created successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating staff.' });
  }
});

// PATCH /api/auth/users/:id/status (ADMIN ONLY)
router.patch('/users/:id/status', verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (req.user.userId === parseInt(req.params.id, 10)) {
      return res.status(400).json({ message: 'You cannot alter your own account status.' });
    }
    await db.query('UPDATE users SET account_status = ? WHERE user_id = ?', [status, req.params.id]);
    res.json({ message: 'Account status updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating status.' });
  }
});

// PATCH /api/auth/users/:id/password (ADMIN ONLY)
router.patch('/users/:id/password', verifyAdmin, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query('UPDATE users SET password = ? WHERE user_id = ?', [hashedPassword, req.params.id]);
    res.json({ message: 'Password reset successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error resetting password.' });
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
    if (user.account_status === 'terminated') {
      return res.status(403).json({ message: 'Account access has been revoked.' });
    }

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
