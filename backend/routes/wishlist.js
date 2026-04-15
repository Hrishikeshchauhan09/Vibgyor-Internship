const express = require('express');
const db = require('../config/db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/wishlist - Get current user's wishlist
router.get('/', verifyToken, async (req, res) => {
  try {
    const [items] = await db.query(`
      SELECT w.wishlist_id, w.added_at, p.*
      FROM wishlist w
      JOIN products p ON p.product_id = w.product_id
      WHERE w.user_id = ?
      ORDER BY w.added_at DESC
    `, [req.user.userId]);
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching wishlist' });
  }
});

// POST /api/wishlist - Add item to wishlist
router.post('/', verifyToken, async (req, res) => {
  try {
    const { product_id } = req.body;
    if (!product_id) {
      return res.status(400).json({ message: 'product_id is required' });
    }

    // Check if already in wishlist
    const [existing] = await db.query(
      'SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?',
      [req.user.userId, product_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Product is already in your wishlist.' });
    }

    await db.query(
      'INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)',
      [req.user.userId, product_id]
    );
    res.status(201).json({ message: 'Product added to wishlist' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding to wishlist' });
  }
});

// DELETE /api/wishlist/:id - Remove item from wishlist by wishlist_id
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await db.query(
      'DELETE FROM wishlist WHERE wishlist_id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );
    res.json({ message: 'Product removed from wishlist' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error removing from wishlist' });
  }
});

module.exports = router;
