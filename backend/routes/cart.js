const express = require('express');
const db = require('../config/db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/cart — get cart for logged in user
router.get('/', verifyToken, async (req, res) => {
  try {
    const [items] = await db.query(
      `SELECT c.cart_id, c.quantity, c.added_at, p.product_id, p.name, p.price, p.image_url
       FROM cart c JOIN products p ON p.product_id = c.product_id
       WHERE c.user_id = ?`,
      [req.user.userId]
    );
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching cart.' });
  }
});

// POST /api/cart — add item to cart
router.post('/', verifyToken, async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    // Check if already in cart
    const [existing] = await db.query(
      'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
      [req.user.userId, product_id]
    );
    if (existing.length > 0) {
      await db.query(
        'UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?',
        [quantity || 1, req.user.userId, product_id]
      );
      return res.json({ message: 'Cart item quantity updated.' });
    }
    await db.query(
      'INSERT INTO cart (user_id, product_id, quantity, added_at) VALUES (?, ?, ?, NOW())',
      [req.user.userId, product_id, quantity || 1]
    );
    res.status(201).json({ message: 'Item added to cart.' });
  } catch (err) {
    res.status(500).json({ message: 'Error adding to cart.' });
  }
});

// PUT /api/cart/:cartId — update quantity
router.put('/:cartId', verifyToken, async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity < 1) return res.status(400).json({ message: 'Quantity must be at least 1.' });
    await db.query(
      'UPDATE cart SET quantity = ? WHERE cart_id = ? AND user_id = ?',
      [quantity, req.params.cartId, req.user.userId]
    );
    res.json({ message: 'Cart updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating cart.' });
  }
});

// DELETE /api/cart/:cartId — remove from cart
router.delete('/:cartId', verifyToken, async (req, res) => {
  try {
    await db.query(
      'DELETE FROM cart WHERE cart_id = ? AND user_id = ?',
      [req.params.cartId, req.user.userId]
    );
    res.json({ message: 'Item removed from cart.' });
  } catch (err) {
    res.status(500).json({ message: 'Error removing from cart.' });
  }
});

module.exports = router;
