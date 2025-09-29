const express = require('express');
const aiSignalService = require('../services/aiSignalService.cjs');
const binanceService = require('../services/binanceService.cjs');
const Signal = require('../models/Signal.cjs');
const { authenticateToken } = require('../middleware/auth.cjs');

const router = express.Router();

// Generate AI signal for a specific symbol
router.post('/generate-signal', authenticateToken, async (req, res) => {
  try {
    const { symbol, timeframe = '1h' } = req.body;
    
    if (!symbol) {
      return res.status(400).json({
        success: false,
        message: 'Symbol is required'
      });
    }
    
    // Generate AI signal
    const aiSignal = await aiSignalService.generateSignal(symbol, timeframe);
    
    // Save signal to database if it's not a HOLD signal
    if (aiSignal.type !== 'HOLD') {
      const signalId = await Signal.create({
        userId: req.user.userId,
        pair: symbol,
        type: aiSignal.type,
        price: aiSignal.price,
        confidence: aiSignal.confidence,
        timeframe: aiSignal.timeframe,
        indicators: aiSignal.indicators,
        technicalAnalysis: aiSignal.technicalAnalysis,
        riskRewardRatio: aiSignal.riskRewardRatio,
        stopLoss: aiSignal.stopLoss,
        takeProfit: aiSignal.takeProfit,
        expiresAt: aiSignal.expiresAt
      });
      
      aiSignal.id = signalId;
    }
    
    res.json({
      success: true,
      data: aiSignal
    });
    
  } catch (error) {
    console.error('AI signal generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI signal',
      error: error.message
    });
  }
});

// Batch generate signals for multiple symbols
router.post('/generate-batch-signals', authenticateToken, async (req, res) => {
  try {
    const { symbols, timeframe = '1h' } = req.body;
    
    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Symbols array is required'
      });
    }
    
    if (symbols.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 10 symbols allowed per batch'
      });
    }
    
    const signals = [];
    const errors = [];
    
    // Generate signals for each symbol
    for (const symbol of symbols) {
      try {
        const aiSignal = await aiSignalService.generateSignal(symbol, timeframe);
        
        // Save to database if not HOLD
        if (aiSignal.type !== 'HOLD') {
          const signalId = await Signal.create({
            userId: req.user.userId,
            pair: symbol,
            type: aiSignal.type,
            price: aiSignal.price,
            confidence: aiSignal.confidence,
            timeframe: aiSignal.timeframe,
            indicators: aiSignal.indicators,
            technicalAnalysis: aiSignal.technicalAnalysis,
            riskRewardRatio: aiSignal.riskRewardRatio,
            stopLoss: aiSignal.stopLoss,
            takeProfit: aiSignal.takeProfit,
            expiresAt: aiSignal.expiresAt
          });
          
          aiSignal.id = signalId;
        }
        
        signals.push(aiSignal);
        
      } catch (error) {
        errors.push({
          symbol,
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      data: {
        signals,
        errors,
        summary: {
          total: symbols.length,
          successful: signals.length,
          failed: errors.length
        }
      }
    });
    
  } catch (error) {
    console.error('Batch signal generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate batch signals',
      error: error.message
    });
  }
});

// Get AI signal statistics
router.get('/signal-stats', authenticateToken, async (req, res) => {
  try {
    const stats = aiSignalService.getSignalStats();
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Signal stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get signal statistics',
      error: error.message
    });
  }
});

// Get recent AI signals
router.get('/recent-signals', authenticateToken, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const signals = aiSignalService.getRecentSignals(parseInt(limit));
    
    res.json({
      success: true,
      data: signals
    });
    
  } catch (error) {
    console.error('Recent signals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recent signals',
      error: error.message
    });
  }
});

// Analyze market conditions for a symbol
router.get('/market-analysis/:symbol', authenticateToken, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { timeframe = '1h' } = req.query;
    
    // Get market data
    const klineData = await binanceService.getKlineData(symbol, timeframe, 100);
    const technicalIndicators = binanceService.calculateTechnicalIndicators(klineData);
    const ticker = await binanceService.getSymbolTicker(symbol);
    
    // Analyze market conditions
    const marketAnalysis = aiSignalService.analyzeMarketConditions(klineData, technicalIndicators);
    
    res.json({
      success: true,
      data: {
        symbol,
        timeframe,
        currentPrice: parseFloat(ticker.lastPrice),
        priceChange24h: parseFloat(ticker.priceChangePercent),
        volume24h: parseFloat(ticker.volume),
        technicalIndicators,
        marketAnalysis,
        lastUpdated: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Market analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze market conditions',
      error: error.message
    });
  }
});

// Get technical indicators for a symbol
router.get('/technical-indicators/:symbol', authenticateToken, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { timeframe = '1h', limit = 100 } = req.query;
    
    const klineData = await binanceService.getKlineData(symbol, timeframe, parseInt(limit));
    const indicators = binanceService.calculateTechnicalIndicators(klineData);
    
    if (!indicators) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient data to calculate technical indicators'
      });
    }
    
    res.json({
      success: true,
      data: {
        symbol,
        timeframe,
        indicators,
        dataPoints: klineData.length,
        lastUpdated: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Technical indicators error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get technical indicators',
      error: error.message
    });
  }
});

// Clear AI signal history (admin only)
router.delete('/clear-history', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin (you might want to add proper admin check)
    if (req.user.username !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    
    aiSignalService.clearHistory();
    
    res.json({
      success: true,
      message: 'AI signal history cleared successfully'
    });
    
  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear signal history',
      error: error.message
    });
  }
});

module.exports = router;