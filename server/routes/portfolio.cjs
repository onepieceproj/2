const express = require('express');
const Portfolio = require('../models/Portfolio.cjs');
const { authenticateToken } = require('../middleware/auth.cjs');

const router = express.Router();

// Get user portfolio
router.get('/', authenticateToken, async (req, res) => {
  try {
    const portfolio = await Portfolio.findByUser(req.user.userId);
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }
    
    res.json({
      success: true,
      data: portfolio
    });
  } catch (error) {
    console.error('Portfolio fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio',
      error: error.message
    });
  }
});

// Get portfolio holdings
router.get('/holdings', authenticateToken, async (req, res) => {
  try {
    const holdings = await Portfolio.getHoldings(req.user.userId);
    
    res.json({
      success: true,
      data: holdings
    });
  } catch (error) {
    console.error('Holdings fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch holdings',
      error: error.message
    });
  }
});

// Update portfolio balance
router.put('/balance', authenticateToken, async (req, res) => {
  try {
    const { totalBalance, availableBalance, lockedBalance = 0 } = req.body;
    
    if (totalBalance === undefined || availableBalance === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Total balance and available balance are required'
      });
    }
    
    await Portfolio.updateBalance(req.user.userId, totalBalance, availableBalance, lockedBalance);
    const portfolio = await Portfolio.findByUser(req.user.userId);
    
    res.json({
      success: true,
      message: 'Portfolio balance updated successfully',
      data: portfolio
    });
  } catch (error) {
    console.error('Balance update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update portfolio balance',
      error: error.message
    });
  }
});

// Update portfolio P&L
router.put('/pnl', authenticateToken, async (req, res) => {
  try {
    const { totalPnl, dailyPnl = 0 } = req.body;
    
    if (totalPnl === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Total P&L is required'
      });
    }
    
    await Portfolio.updatePnL(req.user.userId, totalPnl, dailyPnl);
    const portfolio = await Portfolio.findByUser(req.user.userId);
    
    res.json({
      success: true,
      message: 'Portfolio P&L updated successfully',
      data: portfolio
    });
  } catch (error) {
    console.error('P&L update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update portfolio P&L',
      error: error.message
    });
  }
});

// Add or update holding
router.post('/holdings', authenticateToken, async (req, res) => {
  try {
    const { symbol, quantity, avgPrice, assetName } = req.body;
    
    if (!symbol || quantity === undefined || avgPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Symbol, quantity, and average price are required'
      });
    }
    
    await Portfolio.updateHolding(req.user.userId, symbol, quantity, avgPrice, assetName);
    const holdings = await Portfolio.getHoldings(req.user.userId);
    
    res.json({
      success: true,
      message: 'Holding updated successfully',
      data: holdings
    });
  } catch (error) {
    console.error('Holding update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update holding',
      error: error.message
    });
  }
});

// Remove holding
router.delete('/holdings/:symbol', authenticateToken, async (req, res) => {
  try {
    const { symbol } = req.params;
    
    await Portfolio.removeHolding(req.user.userId, symbol);
    const holdings = await Portfolio.getHoldings(req.user.userId);
    
    res.json({
      success: true,
      message: 'Holding removed successfully',
      data: holdings
    });
  } catch (error) {
    console.error('Holding removal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove holding',
      error: error.message
    });
  }
});

// Get portfolio value calculation
router.get('/value', authenticateToken, async (req, res) => {
  try {
    const portfolioValue = await Portfolio.calculatePortfolioValue(req.user.userId);
    
    res.json({
      success: true,
      data: portfolioValue
    });
  } catch (error) {
    console.error('Portfolio value calculation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate portfolio value',
      error: error.message
    });
  }
});

// Get performance metrics
router.get('/performance', authenticateToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const metrics = await Portfolio.getPerformanceMetrics(req.user.userId, parseInt(days));
    
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Performance metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance metrics',
      error: error.message
    });
  }
});

// Get portfolio diversification
router.get('/diversification', authenticateToken, async (req, res) => {
  try {
    const diversification = await Portfolio.getDiversification(req.user.userId);
    
    res.json({
      success: true,
      data: diversification
    });
  } catch (error) {
    console.error('Diversification fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio diversification',
      error: error.message
    });
  }
});

// Get recent portfolio activity
router.get('/activity', authenticateToken, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const activity = await Portfolio.getRecentActivity(req.user.userId, parseInt(limit));
    
    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Portfolio activity fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio activity',
      error: error.message
    });
  }
});

// Get portfolio summary (overview with all key metrics)
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const [portfolio, holdings, portfolioValue, performance] = await Promise.all([
      Portfolio.findByUser(req.user.userId),
      Portfolio.getHoldings(req.user.userId),
      Portfolio.calculatePortfolioValue(req.user.userId),
      Portfolio.getPerformanceMetrics(req.user.userId, 30)
    ]);
    
    res.json({
      success: true,
      data: {
        portfolio,
        holdings,
        portfolioValue,
        performance,
        summary: {
          totalValue: portfolio.total_balance + portfolioValue.total_holdings_value,
          totalPnL: portfolio.total_pnl + portfolioValue.total_unrealized_pnl,
          holdingsCount: portfolioValue.total_holdings,
          activePositions: portfolio.active_positions
        }
      }
    });
  } catch (error) {
    console.error('Portfolio summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio summary',
      error: error.message
    });
  }
});

module.exports = router;