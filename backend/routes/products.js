const express = require('express');
const db = require('../config/db');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/products — all active products (with optional category filter)
router.get('/', async (req, res) => {
  try {
    const { category_id } = req.query;
    let query = `
      SELECT p.*, c.category_name FROM products p
      LEFT JOIN categories c ON c.category_id = p.category_id
      WHERE p.status = true
    `;
    const params = [];
    if (category_id) {
      query += ' AND p.category_id = ?';
      params.push(category_id);
    }
    query += ' ORDER BY p.created_at DESC';
    const [products] = await db.query(query, params);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products.' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const [products] = await db.query(
      'SELECT p.*, c.category_name FROM products p LEFT JOIN categories c ON c.category_id = p.category_id WHERE p.product_id = ?',
      [req.params.id]
    );
    if (products.length === 0) return res.status(404).json({ message: 'Product not found.' });
    res.json(products[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching product.' });
  }
});

// POST /api/products (admin)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { category_id, name, description, price, stock, image_url } = req.body;
    if (!name || !price) return res.status(400).json({ message: 'Name and price are required.' });
    const [result] = await db.query(
      'INSERT INTO products (category_id, name, description, price, stock, image_url, created_at, status) VALUES (?, ?, ?, ?, ?, ?, NOW(), true)',
      [category_id, name, description || '', price, stock || 0, image_url || '']
    );
    res.status(201).json({ message: 'Product created.', productId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Error creating product.' });
  }
});

// PUT /api/products/:id (admin)
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const { category_id, name, description, price, stock, image_url } = req.body;
    await db.query(
      'UPDATE products SET category_id=?, name=?, description=?, price=?, stock=?, image_url=? WHERE product_id=?',
      [category_id, name, description, price, stock, image_url, req.params.id]
    );
    res.json({ message: 'Product updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating product.' });
  }
});

// DELETE /api/products/:id (admin, soft delete)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await db.query('UPDATE products SET status = false WHERE product_id = ?', [req.params.id]);
    res.json({ message: 'Product deactivated.' });
  } catch (err) {
    res.status(500).json({ message: 'Error deactivating product.' });
  }
});

module.exports = router;
