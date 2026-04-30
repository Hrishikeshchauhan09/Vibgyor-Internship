const express = require('express');
const db = require('../config/db');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/cart — get cart for logged in user
router.get('/', verifyToken, async (req, res) => {
  try {
    const [items] = await db.query(
      `SELECT c.cart_id, c.quantity, c.created_at, p.product_id, p.name, p.price, p.image_url, c.total_price
       FROM carts c JOIN products p ON p.product_id = c.product_id
       WHERE c.customer_id = ?`,
      [req.user.userId]
    );
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching cart.' });
  }
});

// POST /api/cart — add item to cart
router.post('/', verifyToken, async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    
    // Get product price to calculate total
    const [product] = await db.query('SELECT price FROM products WHERE product_id = ?', [product_id]);
    if (product.length === 0) return res.status(404).json({ message: 'Product not found' });
    const price = product[0].price;
    const addQty = quantity || 1;
    const itemTotal = price * addQty;

    // Check if already in cart
    const [existing] = await db.query(
      'SELECT * FROM carts WHERE customer_id = ? AND product_id = ?',
      [req.user.userId, product_id]
    );
    if (existing.length > 0) {
      const newQty = existing[0].quantity + addQty;
      const newTotal = newQty * price;
      await db.query(
        'UPDATE carts SET quantity = ?, total_price = ? WHERE customer_id = ? AND product_id = ?',
        [newQty, newTotal, req.user.userId, product_id]
      );
      return res.json({ message: 'Cart item quantity updated.' });
    }
    
    await db.query(
      'INSERT INTO carts (customer_id, product_id, quantity, total_price, created_at) VALUES (?, ?, ?, ?, NOW())',
      [req.user.userId, product_id, addQty, itemTotal]
    );
    res.status(201).json({ message: 'Item added to cart.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding to cart.' });
  }
});

// PUT /api/cart/:cartId — update quantity
router.put('/:cartId', verifyToken, async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity < 1) return res.status(400).json({ message: 'Quantity must be at least 1.' });
    
    const [existing] = await db.query(
      'SELECT c.*, p.price FROM carts c JOIN products p ON c.product_id = p.product_id WHERE c.cart_id = ? AND c.customer_id = ?',
      [req.params.cartId, req.user.userId]
    );
    
    if (existing.length === 0) return res.status(404).json({ message: 'Cart item not found.' });
    
    const newTotal = existing[0].price * quantity;
    
    await db.query(
      'UPDATE carts SET quantity = ?, total_price = ? WHERE cart_id = ? AND customer_id = ?',
      [quantity, newTotal, req.params.cartId, req.user.userId]
    );
    res.json({ message: 'Cart updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating cart.' });
  }
});

// DELETE /api/cart/:cartId — remove from cart
router.delete('/:cartId', verifyToken, async (req, res) => {
  try {
    await db.query(
      'DELETE FROM carts WHERE cart_id = ? AND customer_id = ?',
      [req.params.cartId, req.user.userId]
    );
    res.json({ message: 'Item removed from cart.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error removing from cart.' });
  }
});

// GET /api/cart/all - admin route for cart abandonment
router.get('/all', verifyAdmin, async (req, res) => {
  try {
    const [carts] = await db.query(
      `SELECT c.cart_id, c.quantity, c.total_price, c.created_at, c.updated_at,
              p.name AS product_name, p.price,
              CONCAT(u.first_name, ' ', u.last_name) AS customer_name, u.email
       FROM carts c
       JOIN products p ON c.product_id = p.product_id
       JOIN users u ON c.customer_id = u.user_id
       ORDER BY c.updated_at DESC`
    );
    res.json(carts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching all carts.' });
  }
});

module.exports = router;
