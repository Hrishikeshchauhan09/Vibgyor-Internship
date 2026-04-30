const express = require('express');
const db = require('../config/db');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/shipping/all — Admin: Get all shipping records with order details
router.get('/all', verifyAdmin, async (req, res) => {
  try {
    const [shippings] = await db.query(
      `SELECT s.*, o.total_amount, o.shipping_address, 
              CONCAT(u.first_name, ' ', u.last_name) AS customer_name, u.email 
       FROM shipping s
       JOIN orders o ON s.order_id = o.order_id
       JOIN users u ON o.user_id = u.user_id
       ORDER BY s.updated_at DESC`
    );
    res.json(shippings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching shipping records.' });
  }
});

// GET /api/shipping/track/:orderId — Customer: Track specific order shipment
router.get('/track/:orderId', verifyToken, async (req, res) => {
  try {
    const [shipping] = await db.query(
      `SELECT s.* FROM shipping s 
       JOIN orders o ON s.order_id = o.order_id 
       WHERE s.order_id = ? AND o.user_id = ?`,
      [req.params.orderId, req.user.userId]
    );
    
    if (shipping.length === 0) {
      return res.status(404).json({ message: 'Shipping details not found for this order.' });
    }
    
    res.json(shipping[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching tracking details.' });
  }
});

// PUT /api/shipping/:id — Admin: Update shipping info (courier, tracking, status)
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const { courier_service, tracking_number, shipping_status } = req.body;
    
    await db.query(
      `UPDATE shipping 
       SET courier_service = ?, tracking_number = ?, shipping_status = ? 
       WHERE shipping_id = ?`,
      [courier_service, tracking_number, shipping_status, req.params.id]
    );
    
    // Also optionally update the order status to match shipping status
    if (shipping_status === 'Shipped' || shipping_status === 'Delivered') {
      const [shipRecord] = await db.query('SELECT order_id FROM shipping WHERE shipping_id = ?', [req.params.id]);
      if (shipRecord.length > 0) {
        await db.query('UPDATE orders SET status = ? WHERE order_id = ?', 
          [shipping_status.toLowerCase(), shipRecord[0].order_id]
        );
      }
    }
    
    res.json({ message: 'Shipping information updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating shipping info.' });
  }
});

module.exports = router;
