const express = require('express');
const db = require('../config/db');
const { verifyAdmin, verifyToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/categories — all active categories with product count
router.get('/', verifyToken, async (req, res) => {
  try {
    const [categories] = await db.query(`
      SELECT c.*, COUNT(p.product_id) AS product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.category_id AND p.status = true
      WHERE c.status = true
      GROUP BY c.category_id
      ORDER BY c.created_at DESC
    `);
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching categories.' });
  }
});

// GET /api/categories/all — admin: all categories including inactive
router.get('/all', verifyAdmin, async (req, res) => {
  try {
    const [categories] = await db.query(`
      SELECT c.*, COUNT(p.product_id) AS product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.category_id
      GROUP BY c.category_id
      ORDER BY c.created_at DESC
    `);
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching categories.' });
  }
});

// POST /api/categories — create new category (admin only)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { category_name, description } = req.body;
    if (!category_name) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    const [result] = await db.query(
      'INSERT INTO categories (category_name, description, created_at, updated_at, status) VALUES (?, ?, NOW(), NOW(), true)',
      [category_name, description || '']
    );
    res.status(201).json({ message: 'Category created successfully.', categoryId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating category.' });
  }
});

// PUT /api/categories/:id — update category (admin only)
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name, description } = req.body;

    const [existing] = await db.query('SELECT * FROM categories WHERE category_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    await db.query(
      'UPDATE categories SET category_name = ?, description = ?, updated_at = NOW() WHERE category_id = ?',
      [category_name || existing[0].category_name, description ?? existing[0].description, id]
    );
    res.json({ message: 'Category updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating category.' });
  }
});

// DELETE /api/categories/:id — soft delete (admin only)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if products exist in this category
    const [products] = await db.query(
      'SELECT COUNT(*) AS count FROM products WHERE category_id = ? AND status = true',
      [id]
    );

    if (products[0].count > 0) {
      return res.status(409).json({
        message: `Warning: This category has ${products[0].count} active product(s). Please reassign products before deactivating.`,
        productCount: products[0].count
      });
    }

    await db.query(
      'UPDATE categories SET status = false, updated_at = NOW() WHERE category_id = ?',
      [id]
    );
    res.json({ message: 'Category deactivated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deactivating category.' });
  }
});

module.exports = router;
