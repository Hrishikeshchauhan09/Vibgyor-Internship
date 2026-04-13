const express = require('express');
const db = require('../config/db');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/attendance/today - Get logged-in user's attendance for the day
router.get('/today', verifyToken, async (req, res) => {
  try {
    // MySQL CURDATE() equivalent handling timezone consistently
    const [records] = await db.query(
      'SELECT * FROM attendance WHERE user_id = ? AND date = CURDATE()',
      [req.user.userId]
    );
    res.json(records[0] || null);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching attendance status' });
  }
});

// POST /api/attendance/toggle - Toggle check-in vs check-out
router.post('/toggle', verifyToken, async (req, res) => {
  try {
    const [records] = await db.query(
      'SELECT * FROM attendance WHERE user_id = ? AND date = CURDATE()',
      [req.user.userId]
    );

    if (records.length === 0) {
      // User hasn't clocked in yet
      await db.query(
        'INSERT INTO attendance (user_id, date, check_in) VALUES (?, CURDATE(), NOW())',
        [req.user.userId]
      );
      res.status(201).json({ message: 'Shift Started Successfully!' });
    } else if (!records[0].check_out) {
      // User clocked in, now clocking out
      await db.query(
        'UPDATE attendance SET check_out = NOW() WHERE user_id = ? AND date = CURDATE()',
        [req.user.userId]
      );
      res.json({ message: 'Shift Concluded Successfully!' });
    } else {
      res.status(400).json({ message: 'Your shift has already ended for today.' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error updating attendance records' });
  }
});

// GET /api/attendance/all - Get all staff attendance for today (Admin)
router.get('/all', verifyAdmin, async (req, res) => {
  try {
    const [records] = await db.query('SELECT * FROM attendance WHERE date = CURDATE()');
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Error compiling global attendance' });
  }
});

module.exports = router;
