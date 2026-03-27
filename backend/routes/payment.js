const express = require('express');
const db = require('../config/db');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// POST /api/payment — record payment for an order
router.post('/', verifyToken, async (req, res) => {
  try {
    const { order_id, amount, method } = req.body;
    if (!order_id || !amount || !method) {
      return res.status(400).json({ message: 'order_id, amount, and method are required.' });
    }
    const [result] = await db.query(
      "INSERT INTO payment (order_id, amount, method, status, paid_at) VALUES (?, ?, ?, 'completed', NOW())",
      [order_id, amount, method]
    );
    // Update order status to confirmed
    await db.query("UPDATE orders SET status = 'confirmed' WHERE order_id = ?", [order_id]);
    res.status(201).json({ message: 'Payment recorded successfully.', paymentId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Error recording payment.' });
  }
});

// GET /api/payment/order/:orderId — get payment for an order
router.get('/order/:orderId', verifyToken, async (req, res) => {
  try {
    const [payments] = await db.query(
      'SELECT * FROM payment WHERE order_id = ?',
      [req.params.orderId]
    );
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching payment.' });
  }
});

module.exports = router;
