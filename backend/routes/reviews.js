const express = require('express');
const db = require('../config/db');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/reviews/product/:productId — Public: Get all approved reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const [reviews] = await db.query(
      `SELECT r.*, CONCAT(u.first_name, ' ', u.last_name) AS customer_name 
       FROM reviews r
       JOIN users u ON r.customer_id = u.user_id
       WHERE r.product_id = ? AND r.status = true
       ORDER BY r.created_at DESC`,
      [req.params.productId]
    );
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching reviews.' });
  }
});

// GET /api/reviews/all — Admin: Get all reviews for moderation
router.get('/all', verifyAdmin, async (req, res) => {
  try {
    const [reviews] = await db.query(
      `SELECT r.*, p.name AS product_name, CONCAT(u.first_name, ' ', u.last_name) AS customer_name, u.email 
       FROM reviews r
       JOIN products p ON r.product_id = p.product_id
       JOIN users u ON r.customer_id = u.user_id
       ORDER BY r.created_at DESC`
    );
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching all reviews.' });
  }
});

// POST /api/reviews/:productId — Customer: Add a review
router.post('/:productId', verifyToken, async (req, res) => {
  try {
    const { rating, review_text } = req.body;
    
    // Check if user already reviewed this product
    const [existing] = await db.query(
      'SELECT review_id FROM reviews WHERE customer_id = ? AND product_id = ?',
      [req.user.userId, req.params.productId]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ message: 'You have already reviewed this product. You can update it instead.' });
    }

    await db.query(
      `INSERT INTO reviews (product_id, customer_id, rating, review_text, status, created_at) 
       VALUES (?, ?, ?, ?, false, NOW())`,
      [req.params.productId, req.user.userId, rating, review_text]
    );
    
    res.status(201).json({ message: 'Review submitted successfully and is pending approval.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error submitting review.' });
  }
});

// PUT /api/reviews/:reviewId — Customer: Update own review
router.put('/:reviewId', verifyToken, async (req, res) => {
  try {
    const { rating, review_text } = req.body;
    
    // Verify ownership
    const [review] = await db.query('SELECT customer_id FROM reviews WHERE review_id = ?', [req.params.reviewId]);
    
    if (review.length === 0) return res.status(404).json({ message: 'Review not found.' });
    if (review[0].customer_id !== req.user.userId) return res.status(403).json({ message: 'Not authorized.' });

    await db.query(
      `UPDATE reviews 
       SET rating = ?, review_text = ?, status = false 
       WHERE review_id = ?`,
      [rating, review_text, req.params.reviewId]
    );
    
    res.json({ message: 'Review updated and is pending approval.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating review.' });
  }
});

// PUT /api/reviews/:reviewId/status — Admin: Approve or Reject review
router.put('/:reviewId/status', verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body; // true for approve, false for reject/unapprove
    
    await db.query(
      'UPDATE reviews SET status = ? WHERE review_id = ?',
      [status, req.params.reviewId]
    );
    
    res.json({ message: `Review ${status ? 'approved' : 'unapproved'} successfully.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error moderating review.' });
  }
});

// DELETE /api/reviews/:reviewId — Admin or Customer: Delete review
router.delete('/:reviewId', verifyToken, async (req, res) => {
  try {
    // Check ownership if not admin
    if (req.user.role !== 'admin') {
      const [review] = await db.query('SELECT customer_id FROM reviews WHERE review_id = ?', [req.params.reviewId]);
      if (review.length === 0) return res.status(404).json({ message: 'Review not found.' });
      if (review[0].customer_id !== req.user.userId) return res.status(403).json({ message: 'Not authorized.' });
    }

    await db.query('DELETE FROM reviews WHERE review_id = ?', [req.params.reviewId]);
    res.json({ message: 'Review deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting review.' });
  }
});

module.exports = router;
