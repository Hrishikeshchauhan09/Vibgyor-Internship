const express = require('express');
const db = require('../config/db');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/coupons — Admin: Get all coupons
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const [coupons] = await db.query('SELECT * FROM coupons ORDER BY created_at DESC');
    res.json(coupons);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching coupons.' });
  }
});

// POST /api/coupons — Admin: Create a new coupon
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { coupon_code, discount_type, discount_value, valid_from, valid_to, usage_limit } = req.body;
    
    // Check if code already exists
    const [existing] = await db.query('SELECT coupon_id FROM coupons WHERE coupon_code = ?', [coupon_code.toUpperCase()]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Coupon code already exists.' });
    }

    await db.query(
      `INSERT INTO coupons (coupon_code, discount_type, discount_value, valid_from, valid_to, usage_limit, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, true, NOW())`,
      [coupon_code.toUpperCase(), discount_type, discount_value, valid_from, valid_to, usage_limit]
    );
    
    res.status(201).json({ message: 'Coupon created successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating coupon.' });
  }
});

// PUT /api/coupons/:id/status — Admin: Toggle status
router.put('/:id/status', verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    await db.query('UPDATE coupons SET status = ? WHERE coupon_id = ?', [status, req.params.id]);
    res.json({ message: 'Coupon status updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating coupon status.' });
  }
});

// POST /api/coupons/apply — Customer: Apply coupon at checkout
router.post('/apply', verifyToken, async (req, res) => {
  try {
    const { coupon_code, order_total } = req.body; // order_total should be the subtotal

    const [coupons] = await db.query(
      'SELECT * FROM coupons WHERE coupon_code = ?',
      [coupon_code.toUpperCase()]
    );

    if (coupons.length === 0) {
      return res.status(404).json({ message: 'Invalid coupon code.' });
    }

    const coupon = coupons[0];

    // Check status
    if (!coupon.status) {
      return res.status(400).json({ message: 'This coupon is inactive or expired.' });
    }

    // Check dates with a 24-hour buffer to prevent timezone mismatch issues
    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    validFrom.setHours(validFrom.getHours() - 24); // Buffer for timezone
    
    const validTo = new Date(coupon.valid_to);
    validTo.setHours(validTo.getHours() + 24); // Buffer for timezone

    if (validFrom > now) {
      return res.status(400).json({ message: 'This coupon is not valid yet (Timezone difference).' });
    }
    if (validTo < now) {
      return res.status(400).json({ message: 'This coupon has expired.' });
    }

    // Check usage limit
    if (coupon.usage_limit > 0 && coupon.used_count >= coupon.usage_limit) {
      return res.status(400).json({ message: 'Coupon usage limit has been reached.' });
    }

    // Calculate discount
    let discount_amount = 0;
    if (coupon.discount_type === 'Percentage') {
      discount_amount = (order_total * parseFloat(coupon.discount_value)) / 100;
    } else {
      discount_amount = parseFloat(coupon.discount_value);
    }

    // Ensure discount doesn't exceed total
    if (discount_amount > order_total) {
      discount_amount = order_total;
    }

    res.json({ 
      message: 'Coupon applied successfully!', 
      discount_amount, 
      coupon_id: coupon.coupon_id,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error validating coupon.' });
  }
});

module.exports = router;
