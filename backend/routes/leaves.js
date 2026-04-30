const express = require('express');
const db = require('../config/db');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/leaves - Users see their own, Admin sees all
router.get('/', verifyToken, async (req, res) => {
  try {
    let query, params;
    if (req.user.role === 'admin') {
      query = `
        SELECT l.*, CONCAT(u.first_name, ' ', u.last_name) AS name, u.email
        FROM leave_requests l
        JOIN users u ON u.user_id = l.user_id
        ORDER BY l.created_at DESC
      `;
      params = [];
    } else {
      query = `
        SELECT * FROM leave_requests
        WHERE user_id = ?
        ORDER BY created_at DESC
      `;
      params = [req.user.userId];
    }
    const [leaves] = await db.query(query, params);
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching leave requests.' });
  }
});

// POST /api/leaves - Employees request leave
router.post('/', verifyToken, async (req, res) => {
  try {
    const { reason, start_date, end_date } = req.body;
    if (!reason || !start_date || !end_date) {
      return res.status(400).json({ message: 'Reason, start date, and end date are required.' });
    }
    
    // Validate dates
    if (new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({ message: 'End date cannot be earlier than start date.' });
    }

    await db.query(
      'INSERT INTO leave_requests (user_id, reason, start_date, end_date) VALUES (?, ?, ?, ?)',
      [req.user.userId, reason, start_date, end_date]
    );
    res.status(201).json({ message: 'Leave request submitted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting leave request.' });
  }
});

// PUT /api/leaves/:id/status - HR/Admin approve or reject
router.put('/:id/status', verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }
    await db.query(
      'UPDATE leave_requests SET status = ? WHERE id = ?',
      [status, req.params.id]
    );
    res.json({ message: `Leave request ${status}.` });
  } catch (err) {
    res.status(500).json({ message: 'Error updating leave status.' });
  }
});

module.exports = router;
