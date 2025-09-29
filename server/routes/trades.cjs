const express = require('express');
const Trade = require('../models/Trade.cjs');
const { authenticateToken } = require('../middleware/auth.cjs');

const router = express.Router();

// Get all trades for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, offset = 0, status } = req.query;
    const trades = await Trade.findByUser(req.user.userId, parseInt(limit), parseInt(offset), status);
    
    res.json({
      success: true,
      data: trades,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: trades.length
      }
    });
  } catch (error) {
    console.error('Trades fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trades',
      error: error.message
    });
  }
});

// Get trade history with filters
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const filters = {
      pair: req.query.pair,
      status: req.query.status,
      side: req.query.side,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
      limit: req.query.limit ? parseInt(req.query.limit) : undefined
    };
    
    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });
    
    const trades = await Trade.getTradeHistory(req.user.userId, filters);
    
    res.json({
      success: true,
      data: trades
    });
  } catch (error) {
    console.error('Trade history fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trade history',
      error: error.message
    });
  }
});

// Get open trades
router.get('/open', authenticateToken, async (req, res) => {
  try {
    const trades = await Trade.findOpenTrades(req.user.userId);
    
    res.json({
      success: true,
      data: trades
    });
  } catch (error) {
    console.error('Open trades fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch open trades',
      error: error.message
    });
  }
});

// Get trade by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id);
    
    if (!trade) {
      return res.status(404).json({
        success: false,
        message: 'Trade not found'
      });
    }
    
    // Check if user owns this trade
    if (trade.user_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: trade
    });
  } catch (error) {
    console.error('Trade fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trade',
      error: error.message
    });
  }
});

// Create new trade
router.post('/', authenticateToken, async (req, res) => {
  try {
    const tradeData = {
      userId: req.user.userId,
      ...req.body
    };

    // Validate required fields
    const requiredFields = ['pair', 'side', 'quantity', 'entryPrice'];
    for (const field of requiredFields) {
      if (!tradeData[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }

    // Generate trade ID if not provided
    if (!tradeData.tradeId) {
      tradeData.tradeId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
    }

    const tradeId = await Trade.create(tradeData);
    const trade = await Trade.findById(tradeId);
    
    res.status(201).json({
      success: true,
      message: 'Trade created successfully',
      data: trade
    });
  } catch (error) {
    console.error('Trade creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create trade',
      error: error.message
    });
  }
});

// Generate mock trade

// Close trade
router.put('/:id/close', authenticateToken, async (req, res) => {
  try {
    const { exitPrice, fees = 0, notes } = req.body;
    
    if (!exitPrice) {
      return res.status(400).json({
        success: false,
        message: 'Exit price is required'
      });
    }

    // Verify trade ownership
    const existingTrade = await Trade.findById(req.params.id);
    if (!existingTrade || existingTrade.user_id !== req.user.userId) {
      return res.status(404).json({
        success: false,
        message: 'Trade not found or access denied'
      });
    }

    const trade = await Trade.closeTrade(req.params.id, exitPrice, fees, notes);
    
    res.json({
      success: true,
      message: 'Trade closed successfully',
      data: trade
    });
  } catch (error) {
    console.error('Trade close error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to close trade',
      error: error.message
    });
  }
});

// Cancel trade
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { reason } = req.body;
    
    // Verify trade ownership
    const existingTrade = await Trade.findById(req.params.id);
    if (!existingTrade || existingTrade.user_id !== req.user.userId) {
      return res.status(404).json({
        success: false,
        message: 'Trade not found or access denied'
      });
    }

    const cancelled = await Trade.cancelTrade(req.params.id, reason);
    
    if (!cancelled) {
      return res.status(400).json({
        success: false,
        message: 'Trade cannot be cancelled (may already be closed)'
      });
    }
    
    res.json({
      success: true,
      message: 'Trade cancelled successfully'
    });
  } catch (error) {
    console.error('Trade cancellation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel trade',
      error: error.message
    });
  }
});

// Update stop loss
router.put('/:id/stop-loss', authenticateToken, async (req, res) => {
  try {
    const { stopLoss } = req.body;
    
    if (!stopLoss) {
      return res.status(400).json({
        success: false,
        message: 'Stop loss price is required'
      });
    }

    // Verify trade ownership
    const existingTrade = await Trade.findById(req.params.id);
    if (!existingTrade || existingTrade.user_id !== req.user.userId) {
      return res.status(404).json({
        success: false,
        message: 'Trade not found or access denied'
      });
    }

    await Trade.updateStopLoss(req.params.id, stopLoss);
    const trade = await Trade.findById(req.params.id);
    
    res.json({
      success: true,
      message: 'Stop loss updated successfully',
      data: trade
    });
  } catch (error) {
    console.error('Stop loss update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stop loss',
      error: error.message
    });
  }
});

// Update take profit
router.put('/:id/take-profit', authenticateToken, async (req, res) => {
  try {
    const { takeProfit } = req.body;
    
    if (!takeProfit) {
      return res.status(400).json({
        success: false,
        message: 'Take profit price is required'
      });
    }

    // Verify trade ownership
    const existingTrade = await Trade.findById(req.params.id);
    if (!existingTrade || existingTrade.user_id !== req.user.userId) {
      return res.status(404).json({
        success: false,
        message: 'Trade not found or access denied'
      });
    }

    await Trade.updateTakeProfit(req.params.id, takeProfit);
    const trade = await Trade.findById(req.params.id);
    
    res.json({
      success: true,
      message: 'Take profit updated successfully',
      data: trade
    });
  } catch (error) {
    console.error('Take profit update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update take profit',
      error: error.message
    });
  }
});

// Get trade statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const stats = await Trade.getTradeStats(req.user.userId, parseInt(days));
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Trade stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trade statistics',
      error: error.message
    });
  }
});

// Get pair performance
router.get('/stats/pairs', authenticateToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const pairPerformance = await Trade.getPairPerformance(req.user.userId, parseInt(days));
    
    res.json({
      success: true,
      data: pairPerformance
    });
  } catch (error) {
    console.error('Pair performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pair performance',
      error: error.message
    });
  }
});

module.exports = router;