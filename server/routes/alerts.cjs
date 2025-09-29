const express = require('express');
const database = require('../config/database.cjs');
const { authenticateToken } = require('../middleware/auth.cjs');

const router = express.Router();

// Get user alerts
router.get('/', authenticateToken, async (req, res) => {
  try {
    const sql = `
      SELECT * FROM price_alerts 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `;
    
    const alerts = await database.query(sql, [req.user.userId]);
    
    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Alerts fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts',
      error: error.message
    });
  }
});

// Create new alert
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { symbol, alert_type, target_value } = req.body;
    
    if (!symbol || !alert_type || !target_value) {
      return res.status(400).json({
        success: false,
        message: 'Symbol, alert type, and target value are required'
      });
    }

    const sql = `
      INSERT INTO price_alerts (user_id, symbol, alert_type, target_value)
      VALUES (?, ?, ?, ?)
    `;

    const result = await database.query(sql, [
      req.user.userId, symbol, alert_type, target_value
    ]);

    res.status(201).json({
      success: true,
      message: 'Alert created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Alert creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create alert',
      error: error.message
    });
  }
});

// Delete alert
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const sql = 'DELETE FROM price_alerts WHERE id = ? AND user_id = ?';
    const result = await database.query(sql, [req.params.id, req.user.userId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.json({
      success: true,
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    console.error('Alert deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete alert',
      error: error.message
    });
  }
});

// Toggle alert status
router.put('/:id/toggle', authenticateToken, async (req, res) => {
  try {
    const sql = `
      UPDATE price_alerts 
      SET is_active = NOT is_active 
      WHERE id = ? AND user_id = ?
    `;
    
    const result = await database.query(sql, [req.params.id, req.user.userId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.json({
      success: true,
      message: 'Alert status updated successfully'
    });
  } catch (error) {
    console.error('Alert toggle error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update alert status',
      error: error.message
    });
  }
});

module.exports = router;