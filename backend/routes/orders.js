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
    const { total_amount, shipping_address, coupon_id } = req.body;
    const [result] = await db.query(
      "INSERT INTO orders (user_id, total_amount, shipping_address, status, created_at) VALUES (?, ?, ?, 'pending', NOW())",
      [req.user.userId, total_amount, shipping_address || '']
    );
    // Add default shipping entry
    await db.query(
      "INSERT INTO shipping (order_id, courier_service, tracking_number, shipping_status, shipping_cost, created_at) VALUES (?, 'Pending Assignment', 'Not assigned', 'Processing', 50.00, NOW())",
      [result.insertId]
    );

    // Increment coupon used_count if a coupon was used
    if (coupon_id) {
      await db.query('UPDATE coupons SET used_count = used_count + 1 WHERE coupon_id = ?', [coupon_id]);
    }

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
