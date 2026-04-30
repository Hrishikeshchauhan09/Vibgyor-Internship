const express = require('express');
const db = require('../config/db');
const { verifyAdmin } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const router = express.Router();

// GET /api/customers - List all customers
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const [customers] = await db.query(
      "SELECT user_id, first_name, last_name, email, phone, status, created_at, updated_at FROM users WHERE role = 'customer' ORDER BY created_at DESC"
    );
    res.json(customers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching customers.' });
  }
});

// POST /api/customers - Admin adds a new customer
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { first_name, last_name, email, phone, password } = req.body;
    if (!first_name || !email || !password) {
      return res.status(400).json({ message: 'First name, email, and password are required.' });
    }

    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO users (first_name, last_name, email, phone, password, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [first_name, last_name || '', email, phone || '', hashedPassword, 'customer', true]
    );

    res.status(201).json({ message: 'Customer added successfully.', customerId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding customer.' });
  }
});

// PUT /api/customers/:id - Update customer details
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const { first_name, last_name, phone } = req.body;
    if (!first_name) {
      return res.status(400).json({ message: 'First name is required.' });
    }

    await db.query(
      'UPDATE users SET first_name = ?, last_name = ?, phone = ? WHERE user_id = ? AND role = "customer"',
      [first_name, last_name || '', phone || '', req.params.id]
    );

    res.json({ message: 'Customer updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating customer.' });
  }
});

// PATCH /api/customers/:id/status - Soft delete / Deactivate
router.patch('/:id/status', verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    await db.query(
      'UPDATE users SET status = ? WHERE user_id = ? AND role = "customer"',
      [status, req.params.id]
    );
    res.json({ message: 'Customer status updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating status.' });
  }
});

module.exports = router;
