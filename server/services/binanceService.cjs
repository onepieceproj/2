const axios = require('axios');
const crypto = require('crypto');

class BinanceService {
  constructor() {
    this.baseURL = process.env.BINANCE_TESTNET === 'true' 
      ? 'https://testnet.binance.vision/api/v3'
      : 'https://api.binance.com/api/v3';
    
    this.wsURL = process.env.BINANCE_TESTNET === 'true'
      ? 'wss://testnet.binance.vision/ws'
      : 'wss://stream.binance.com:9443/ws';
    
    this.apiKey = process.env.BINANCE_API_KEY || '';
    this.apiSecret = process.env.BINANCE_SECRET_KEY || '';
  }

  // Create signature for authenticated requests
  createSignature(queryString) {
    return crypto
      .createHmac('sha256', this.apiSecret)
      .update(queryString)
      .digest('hex');
  }

  // Make authenticated request
  async makeAuthenticatedRequest(endpoint, params = {}, method = 'GET') {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('Binance API credentials not configured');
    }

    const timestamp = Date.now();
    const queryString = new URLSearchParams({
      ...params,
      timestamp
    }).toString();

    const signature = this.createSignature(queryString);
    const finalQueryString = `${queryString}&signature=${signature}`;

    try {
      const response = await axios({
        method,
        url: `${this.baseURL}${endpoint}?${finalQueryString}`,
        headers: {
          'X-MBX-APIKEY': this.apiKey
        }
      });
      return response.data;
    } catch (error) {
      console.error('Binance API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Make public request (no authentication required)
  async makePublicRequest(endpoint, params = {}) {
    try {
      const response = await axios.get(`${this.baseURL}${endpoint}`, {
        params
      });
      return response.data;
    } catch (error) {
      console.error('Binance Public API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get market data for multiple symbols
  async getMarketData(symbols = []) {
    try {
      const data = await this.makePublicRequest('/ticker/24hr');
      
      if (symbols.length > 0) {
        return data.filter(ticker => symbols.includes(ticker.symbol));
      }
      
      return data.filter(ticker => ticker.symbol.endsWith('USDT')).slice(0, 20);
    } catch (error) {
      // Return mock data if API fails
      return this.getMockMarketData();
    }
  }

  // Get specific symbol ticker
  async getSymbolTicker(symbol) {
    try {
      return await this.makePublicRequest('/ticker/24hr', { symbol });
    } catch (error) {
      return this.getMockSymbolData(symbol);
    }
  }

  // Get kline/candlestick data
  async getKlineData(symbol, interval = '1h', limit = 100) {
    try {
      const data = await this.makePublicRequest('/klines', {
        symbol,
        interval,
        limit
      });
      
      return data.map(kline => ({
        openTime: kline[0],
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
        volume: parseFloat(kline[5]),
        closeTime: kline[6],
        quoteAssetVolume: parseFloat(kline[7]),
        numberOfTrades: kline[8],
        takerBuyBaseAssetVolume: parseFloat(kline[9]),
        takerBuyQuoteAssetVolume: parseFloat(kline[10])
      }));
    } catch (error) {
      return this.getMockKlineData(limit);
    }
  }

  // Get order book
  async getOrderBook(symbol, limit = 100) {
    try {
      const data = await this.makePublicRequest('/depth', { symbol, limit });
      return {
        bids: data.bids.map(bid => [parseFloat(bid[0]), parseFloat(bid[1])]),
        asks: data.asks.map(ask => [parseFloat(ask[0]), parseFloat(ask[1])]),
        lastUpdateId: data.lastUpdateId
      };
    } catch (error) {
      return this.getMockOrderBook();
    }
  }

  // Get account information (requires authentication)
  async getAccountInfo() {
    try {
      return await this.makeAuthenticatedRequest('/account');
    } catch (error) {
      console.error('Failed to fetch account info:', error);
      throw error;
    }
  }

  // Place a new order (requires authentication)
  async placeOrder(orderData) {
    try {
      const {
        symbol,
        side,
        type,
        quantity,
        price,
        timeInForce = 'GTC',
        stopPrice,
        icebergQty
      } = orderData;

      const params = {
        symbol,
        side,
        type,
        quantity
      };

      if (type === 'LIMIT') {
        params.price = price;
        params.timeInForce = timeInForce;
      }

      if (type === 'STOP_LOSS_LIMIT' || type === 'TAKE_PROFIT_LIMIT') {
        params.price = price;
        params.stopPrice = stopPrice;
        params.timeInForce = timeInForce;
      }

      if (icebergQty) {
        params.icebergQty = icebergQty;
      }

      return await this.makeAuthenticatedRequest('/order', params, 'POST');
    } catch (error) {
      throw new Error(`Failed to place order: ${error.message}`);
    }
  }

  // Cancel an order (requires authentication)
  async cancelOrder(symbol, orderId) {
    try {
      return await this.makeAuthenticatedRequest('/order', {
        symbol,
        orderId
      }, 'DELETE');
    } catch (error) {
      throw new Error(`Failed to cancel order: ${error.message}`);
    }
  }

  // Get open orders (requires authentication)
  async getOpenOrders(symbol = null) {
    try {
      const params = symbol ? { symbol } : {};
      return await this.makeAuthenticatedRequest('/openOrders', params);
    } catch (error) {
      return [];
    }
  }

  // Calculate technical indicators
  calculateTechnicalIndicators(klineData) {
    if (!klineData || klineData.length < 50) {
      return null;
    }

    const closes = klineData.map(k => k.close);
    const highs = klineData.map(k => k.high);
    const lows = klineData.map(k => k.low);
    const volumes = klineData.map(k => k.volume);

    return {
      rsi: this.calculateRSI(closes),
      macd: this.calculateMACD(closes),
      sma20: this.calculateSMA(closes, 20),
      sma50: this.calculateSMA(closes, 50),
      ema12: this.calculateEMA(closes, 12),
      ema26: this.calculateEMA(closes, 26),
      bollingerBands: this.calculateBollingerBands(closes),
      atr: this.calculateATR(highs, lows, closes),
      stochastic: this.calculateStochastic(highs, lows, closes)
    };
  }

  // RSI Calculation
  calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return null;

    const gains = [];
    const losses = [];

    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    const avgGain = gains.slice(-period).reduce((a, b) => a + b) / period;
    const avgLoss = losses.slice(-period).reduce((a, b) => a + b) / period;

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  // MACD Calculation
  calculateMACD(prices) {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    
    if (!ema12 || !ema26) return null;

    const macdLine = ema12 - ema26;
    return {
      macd: macdLine,
      signal: this.calculateEMA([macdLine], 9),
      histogram: macdLine - this.calculateEMA([macdLine], 9)
    };
  }

  // Simple Moving Average
  calculateSMA(prices, period) {
    if (prices.length < period) return null;
    const sum = prices.slice(-period).reduce((a, b) => a + b);
    return sum / period;
  }

  // Exponential Moving Average
  calculateEMA(prices, period) {
    if (prices.length < period) return null;
    
    const multiplier = 2 / (period + 1);
    let ema = prices[0];
    
    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }
    
    return ema;
  }

  // Bollinger Bands
  calculateBollingerBands(prices, period = 20, stdDev = 2) {
    const sma = this.calculateSMA(prices, period);
    if (!sma) return null;

    const recentPrices = prices.slice(-period);
    const variance = recentPrices.reduce((acc, price) => {
      return acc + Math.pow(price - sma, 2);
    }, 0) / period;
    
    const standardDeviation = Math.sqrt(variance);
    
    return {
      upper: sma + (standardDeviation * stdDev),
      middle: sma,
      lower: sma - (standardDeviation * stdDev)
    };
  }

  // Average True Range
  calculateATR(highs, lows, closes, period = 14) {
    if (highs.length < period + 1) return null;

    const trueRanges = [];
    for (let i = 1; i < highs.length; i++) {
      const tr1 = highs[i] - lows[i];
      const tr2 = Math.abs(highs[i] - closes[i - 1]);
      const tr3 = Math.abs(lows[i] - closes[i - 1]);
      trueRanges.push(Math.max(tr1, tr2, tr3));
    }

    return trueRanges.slice(-period).reduce((a, b) => a + b) / period;
  }

  // Stochastic Oscillator
  calculateStochastic(highs, lows, closes, period = 14) {
    if (highs.length < period) return null;

    const recentHighs = highs.slice(-period);
    const recentLows = lows.slice(-period);
    const currentClose = closes[closes.length - 1];

    const highestHigh = Math.max(...recentHighs);
    const lowestLow = Math.min(...recentLows);

    const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
    
    return {
      k: k,
      d: k // Simplified - normally would be SMA of %K
    };
  }

  // Mock data methods for when API is unavailable
  getMockMarketData() {
    return [
      {
        symbol: 'BTCUSDT',
        lastPrice: '43250.50',
        priceChange: '1250.30',
        priceChangePercent: '2.98',
        volume: '28450.75',
        highPrice: '44100.00',
        lowPrice: '41800.25'
      },
      {
        symbol: 'ETHUSDT',
        lastPrice: '2650.75',
        priceChange: '-45.20',
        priceChangePercent: '-1.68',
        volume: '156780.50',
        highPrice: '2720.00',
        lowPrice: '2580.30'
      },
      {
        symbol: 'BNBUSDT',
        lastPrice: '315.80',
        priceChange: '8.45',
        priceChangePercent: '2.75',
        volume: '45230.25',
        highPrice: '322.50',
        lowPrice: '305.60'
      }
    ];
  }

  getMockSymbolData(symbol) {
    const mockData = this.getMockMarketData();
    return mockData.find(d => d.symbol === symbol) || mockData[0];
  }

  getMockKlineData(limit = 100) {
    const data = [];
    let basePrice = 43000;
    const now = Date.now();
    
    for (let i = limit - 1; i >= 0; i--) {
      const timestamp = now - (i * 60000);
      const volatility = 0.002;
      
      const open = basePrice + (Math.random() - 0.5) * basePrice * volatility;
      const close = open + (Math.random() - 0.5) * open * volatility;
      const high = Math.max(open, close) + Math.random() * open * volatility * 0.5;
      const low = Math.min(open, close) - Math.random() * open * volatility * 0.5;
      const volume = 10 + Math.random() * 50;
      
      data.push({
        openTime: timestamp,
        open,
        high,
        low,
        close,
        volume,
        closeTime: timestamp + 59999
      });
      
      basePrice = close;
    }
    
    return data;
  }

  getMockOrderBook() {
    const basePrice = 43250;
    const bids = [];
    const asks = [];
    
    for (let i = 0; i < 20; i++) {
      bids.push([basePrice - (i + 1) * 0.5, Math.random() * 10 + 1]);
      asks.push([basePrice + (i + 1) * 0.5, Math.random() * 10 + 1]);
    }
    
    return { bids, asks, lastUpdateId: Date.now() };
  }

  getMockAccountInfo() {
    return {
      balances: [
        { asset: 'USDT', free: '10000.00000000', locked: '0.00000000' },
        { asset: 'BTC', free: '0.25000000', locked: '0.00000000' },
        { asset: 'ETH', free: '5.50000000', locked: '0.00000000' }
      ]
    };
  }
}

module.exports = new BinanceService();