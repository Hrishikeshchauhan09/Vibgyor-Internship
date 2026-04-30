const express = require('express');
const db = require('../config/db');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// POST /api/payment — record payment for an order
router.post('/', verifyToken, async (req, res) => {
  try {
    // Note: The frontend sends 'method', we map it to 'payment_method' for the DB
    const { order_id, amount, method } = req.body;
    if (!order_id || !amount || !method) {
      return res.status(400).json({ message: 'order_id, amount, and method are required.' });
    }
    const [result] = await db.query(
      "INSERT INTO payments (order_id, amount, payment_method, payment_status, created_at) VALUES (?, ?, ?, 'Paid', NOW())",
      [order_id, amount, method]
    );
    // Update order status to confirmed
    await db.query("UPDATE orders SET status = 'confirmed' WHERE order_id = ?", [order_id]);
    res.status(201).json({ message: 'Payment recorded successfully.', paymentId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error recording payment.' });
  }
});

// GET /api/payment/order/:orderId — get payment for an order
router.get('/order/:orderId', verifyToken, async (req, res) => {
  try {
    const [payments] = await db.query(
      'SELECT * FROM payments WHERE order_id = ?',
      [req.params.orderId]
    );
    res.json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching payment.' });
  }
});

// GET /api/payment/all — admin: get all payments with user and order details
router.get('/all', verifyAdmin, async (req, res) => {
  try {
    const [payments] = await db.query(
      `SELECT p.*, o.total_amount, CONCAT(u.first_name, ' ', u.last_name) AS customer_name, u.email 
       FROM payments p
       JOIN orders o ON p.order_id = o.order_id
       JOIN users u ON o.user_id = u.user_id
       ORDER BY p.created_at DESC`
    );
    res.json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching all payments.' });
  }
});

// PATCH /api/payment/:id/refund — admin: issue a refund
router.patch('/:id/refund', verifyAdmin, async (req, res) => {
  try {
    // Update payment status to Refunded
    await db.query(
      "UPDATE payments SET payment_status = 'Refunded' WHERE payment_id = ?",
      [req.params.id]
    );
    
    // We should also optionally update the order status if needed, 
    // but assignment just says refund payment. Let's keep it scoped to payment.
    
    res.json({ message: 'Refund issued successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error processing refund.' });
  }
});

module.exports = router;
