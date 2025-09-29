const express = require('express');
const Signal = require('../models/Signal.cjs');
const { authenticateToken } = require('../middleware/auth.cjs');

const router = express.Router();

// Get all signals for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const signals = await Signal.findByUser(req.user.userId, parseInt(limit), parseInt(offset));
    
    res.json({
      success: true,
      data: signals,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: signals.length
      }
    });
  } catch (error) {
    console.error('Signals fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch signals',
      error: error.message
    });
  }
});

// Get active signals
router.get('/active', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const signals = await Signal.findActive(parseInt(limit));
    
    res.json({
      success: true,
      data: signals
    });
  } catch (error) {
    console.error('Active signals fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active signals',
      error: error.message
    });
  }
});

// Get signals by trading pair
router.get('/pair/:pair', async (req, res) => {
  try {
    const { pair } = req.params;
    const { limit = 20 } = req.query;
    const signals = await Signal.findByPair(pair, parseInt(limit));
    
    res.json({
      success: true,
      data: signals
    });
  } catch (error) {
    console.error('Pair signals fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch signals for pair',
      error: error.message
    });
  }
});

// Get signal by ID
router.get('/:id', async (req, res) => {
  try {
    const signal = await Signal.findById(req.params.id);
    
    if (!signal) {
      return res.status(404).json({
        success: false,
        message: 'Signal not found'
      });
    }
    
    res.json({
      success: true,
      data: signal
    });
  } catch (error) {
    console.error('Signal fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch signal',
      error: error.message
    });
  }
});

// Create new signal
router.post('/', authenticateToken, async (req, res) => {
  try {
    const signalData = {
      userId: req.user.userId,
      ...req.body
    };

    // Validate required fields
    const requiredFields = ['pair', 'type', 'price', 'confidence', 'timeframe'];
    for (const field of requiredFields) {
      if (!signalData[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }

    // Validate confidence range
    if (signalData.confidence < 0 || signalData.confidence > 100) {
      return res.status(400).json({
        success: false,
        message: 'Confidence must be between 0 and 100'
      });
    }

    const signalId = await Signal.create(signalData);
    const signal = await Signal.findById(signalId);
    
    res.status(201).json({
      success: true,
      message: 'Signal created successfully',
      data: signal
    });
  } catch (error) {
    console.error('Signal creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create signal',
      error: error.message
    });
  }
});

// Generate mock signal

// Update signal status
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['ACTIVE', 'EXECUTED', 'EXPIRED', 'CANCELLED'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    await Signal.updateStatus(req.params.id, status);
    const signal = await Signal.findById(req.params.id);
    
    res.json({
      success: true,
      message: 'Signal status updated successfully',
      data: signal
    });
  } catch (error) {
    console.error('Signal status update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update signal status',
      error: error.message
    });
  }
});

// Delete signal
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const deleted = await Signal.delete(req.params.id, req.user.userId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Signal not found or not authorized to delete'
      });
    }
    
    res.json({
      success: true,
      message: 'Signal deleted successfully'
    });
  } catch (error) {
    console.error('Signal deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete signal',
      error: error.message
    });
  }
});

// Get signal statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const stats = await Signal.getStats(req.user.userId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Signal stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch signal statistics',
      error: error.message
    });
  }
});

// Expire old signals (maintenance endpoint)
router.post('/expire-old', authenticateToken, async (req, res) => {
  try {
    const expiredCount = await Signal.expireOldSignals();
    
    res.json({
      success: true,
      message: `${expiredCount} signals expired successfully`,
      data: { expiredCount }
    });
  } catch (error) {
    console.error('Signal expiration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to expire old signals',
      error: error.message
    });
  }
});

module.exports = router;