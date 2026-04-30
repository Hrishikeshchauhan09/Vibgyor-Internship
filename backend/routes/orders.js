const express = require('express');
const db = require('../config/db');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/orders — user's own orders
router.get('/', verifyToken, async (req, res) => {
  try {
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders.' });
  }
});

// GET /api/orders/all — admin: all orders
router.get('/all', verifyAdmin, async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.*, CONCAT(u.first_name, ' ', u.last_name) AS customer_name, u.email FROM orders o
       JOIN users u ON u.user_id = o.user_id ORDER BY o.created_at DESC`
    );
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders.' });
  }
});

// POST /api/orders — place a new order
router.post('/', verifyToken, async (req, res) => {
  try {
    const { total_amount, shipping_address } = req.body;
    const [result] = await db.query(
      "INSERT INTO orders (user_id, total_amount, shipping_address, status, created_at) VALUES (?, ?, ?, 'pending', NOW())",
      [req.user.userId, total_amount, shipping_address || '']
    );
    // Clear cart after order
    await db.query('DELETE FROM carts WHERE customer_id = ?', [req.user.userId]);
    res.status(201).json({ message: 'Order placed successfully.', orderId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Error placing order.' });
  }
});

// PUT /api/orders/:id/status — admin update order status
router.put('/:id/status', verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    await db.query('UPDATE orders SET status = ? WHERE order_id = ?', [status, req.params.id]);
    res.json({ message: 'Order status updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating order status.' });
  }
});

module.exports = router;
