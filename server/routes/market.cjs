const express = require('express');
const MarketData = require('../models/MarketData.cjs');

const router = express.Router();

// Get latest market prices
router.get('/prices', async (req, res) => {
  try {
    const { symbols } = req.query;
    const symbolArray = symbols ? symbols.split(',') : [];
    
    const prices = await MarketData.getLatestPrices(symbolArray);
    
    res.json({
      success: true,
      data: prices
    });
  } catch (error) {
    console.error('Market prices fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch market prices',
      error: error.message
    });
  }
});

// Get price for specific symbol
router.get('/price/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const price = await MarketData.getLatestPrice(symbol);
    
    if (!price) {
      return res.status(404).json({
        success: false,
        message: 'Price data not found for symbol'
      });
    }
    
    res.json({
      success: true,
      data: price
    });
  } catch (error) {
    console.error('Symbol price fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch symbol price',
      error: error.message
    });
  }
});

// Get price history for symbol
router.get('/history/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { hours = 24 } = req.query;
    
    const history = await MarketData.getPriceHistory(symbol, parseInt(hours));
    
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Price history fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch price history',
      error: error.message
    });
  }
});

// Get technical indicators for symbol
router.get('/indicators/:symbol/:timeframe', async (req, res) => {
  try {
    const { symbol, timeframe } = req.params;
    const indicators = await MarketData.getTechnicalIndicators(symbol, timeframe);
    
    if (!indicators) {
      return res.status(404).json({
        success: false,
        message: 'Technical indicators not found'
      });
    }
    
    res.json({
      success: true,
      data: indicators
    });
  } catch (error) {
    console.error('Technical indicators fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch technical indicators',
      error: error.message
    });
  }
});

// Get market overview
router.get('/overview', async (req, res) => {
  try {
    const overview = await MarketData.getMarketOverview();
    
    res.json({
      success: true,
      data: overview
    });
  } catch (error) {
    console.error('Market overview fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch market overview',
      error: error.message
    });
  }
});

// Get top movers
router.get('/movers', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const movers = await MarketData.getTopMovers(parseInt(limit));
    
    res.json({
      success: true,
      data: movers
    });
  } catch (error) {
    console.error('Top movers fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top movers',
      error: error.message
    });
  }
});

// Save market data (admin endpoint)
router.post('/data', async (req, res) => {
  try {
    const { symbol, ...priceData } = req.body;
    
    if (!symbol || !priceData.price) {
      return res.status(400).json({
        success: false,
        message: 'Symbol and price are required'
      });
    }
    
    const dataId = await MarketData.savePrice(symbol, priceData);
    
    res.status(201).json({
      success: true,
      message: 'Market data saved successfully',
      data: { id: dataId }
    });
  } catch (error) {
    console.error('Market data save error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save market data',
      error: error.message
    });
  }
});

// Save technical indicators (admin endpoint)
router.post('/indicators', async (req, res) => {
  try {
    const { symbol, timeframe, ...indicators } = req.body;
    
    if (!symbol || !timeframe) {
      return res.status(400).json({
        success: false,
        message: 'Symbol and timeframe are required'
      });
    }
    
    await MarketData.saveTechnicalIndicators(symbol, timeframe, indicators);
    
    res.status(201).json({
      success: true,
      message: 'Technical indicators saved successfully'
    });
  } catch (error) {
    console.error('Technical indicators save error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save technical indicators',
      error: error.message
    });
  }
});

// Generate mock market data

// Clean old market data (maintenance endpoint)
router.delete('/cleanup', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const result = await MarketData.cleanOldData(parseInt(days));
    
    res.json({
      success: true,
      message: 'Old market data cleaned successfully',
      data: result
    });
  } catch (error) {
    console.error('Market data cleanup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clean old market data',
      error: error.message
    });
  }
});

module.exports = router;