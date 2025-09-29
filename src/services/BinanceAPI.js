import axios from 'axios';

class BinanceAPI {
  constructor() {
    this.baseURL = 'https://api.binance.com/api/v3';
    this.wsURL = 'wss://stream.binance.com:9443/ws';
    this.apiKey = process.env.REACT_APP_BINANCE_API_KEY || '';
    this.apiSecret = process.env.REACT_APP_BINANCE_API_SECRET || '';
  }

  async makeRequest(endpoint, params = {}) {
    try {
      const response = await axios.get(`${this.baseURL}${endpoint}`, {
        params,
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

  async getMarketData() {
    try {
      const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'DOTUSDT'];
      const promises = symbols.map(symbol => 
        this.makeRequest('/ticker/24hr', { symbol })
      );
      
      const results = await Promise.all(promises);
      return results.map((data, index) => ({
        symbol: symbols[index],
        price: parseFloat(data.lastPrice),
        change: parseFloat(data.priceChange),
        changePercent: parseFloat(data.priceChangePercent),
        volume: parseFloat(data.volume),
        high: parseFloat(data.highPrice),
        low: parseFloat(data.lowPrice),
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to fetch market data from Binance API:', error);
      throw error;
    }
  }

  getMockMarketData() {
    return [
      {
        symbol: 'BTCUSDT',
        price: 43250.50,
        change: 1250.30,
        changePercent: 2.98,
        volume: 28450.75,
        high: 44100.00,
        low: 41800.25,
        timestamp: Date.now()
      },
      {
        symbol: 'ETHUSDT',
        price: 2650.75,
        change: -45.20,
        changePercent: -1.68,
        volume: 156780.50,
        high: 2720.00,
        low: 2580.30,
        timestamp: Date.now()
      },
      {
        symbol: 'BNBUSDT',
        price: 315.80,
        change: 8.45,
        changePercent: 2.75,
        volume: 45230.25,
        high: 322.50,
        low: 305.60,
        timestamp: Date.now()
      },
      {
        symbol: 'ADAUSDT',
        price: 0.4850,
        change: 0.0125,
        changePercent: 2.64,
        volume: 892450.75,
        high: 0.4920,
        low: 0.4680,
        timestamp: Date.now()
      },
      {
        symbol: 'DOTUSDT',
        price: 7.25,
        change: -0.18,
        changePercent: -2.42,
        volume: 234560.30,
        high: 7.58,
        low: 7.05,
        timestamp: Date.now()
      }
    ];
  }

  async getKlineData(symbol, interval, limit = 100) {
    try {
      const data = await this.makeRequest('/klines', {
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
        closeTime: kline[6]
      }));
    } catch (error) {
      // Return mock kline data if API fails
      return this.getMockKlineData(limit);
    }
  }

  getMockKlineData(limit = 100) {
    const data = [];
    let basePrice = 43000;
    const now = Date.now();
    
    for (let i = limit - 1; i >= 0; i--) {
      const timestamp = now - (i * 60000); // 1 minute intervals
      const volatility = 0.002; // 0.2% volatility
      
      const open = basePrice + (Math.random() - 0.5) * basePrice * volatility;
      const close = open + (Math.random() - 0.5) * open * volatility;
      const high = Math.max(open, close) + Math.random() * open * volatility * 0.5;
      const low = Math.min(open, close) - Math.random() * open * volatility * 0.5;
      const volume = 10 + Math.random() * 50;
      
      data.push([
        timestamp,
        open.toFixed(2),
        high.toFixed(2),
        low.toFixed(2),
        close.toFixed(2),
        volume.toFixed(2),
        timestamp + 59999
      ]);
      
      basePrice = close;
    }
    
    return data;
  }

  async getOrderBook(symbol, limit = 100) {
    try {
      const data = await this.makeRequest('/depth', { symbol, limit });
      return {
        bids: data.bids.map(bid => [parseFloat(bid[0]), parseFloat(bid[1])]),
        asks: data.asks.map(ask => [parseFloat(ask[0]), parseFloat(ask[1])]),
        timestamp: Date.now()
      };
    } catch (error) {
      return this.getMockOrderBook();
    }
  }

  getMockOrderBook() {
    const basePrice = 43250;
    const bids = [];
    const asks = [];
    
    for (let i = 0; i < 20; i++) {
      bids.push([
        basePrice - (i + 1) * 0.5,
        Math.random() * 10 + 1
      ]);
      asks.push([
        basePrice + (i + 1) * 0.5,
        Math.random() * 10 + 1
      ]);
    }
    
    return { bids, asks, timestamp: Date.now() };
  }

  async getAccountInfo() {
    try {
      // This would require signed request with API key and secret
      const data = await this.makeRequest('/account');
      console.error('Failed to fetch account info:', error);
      throw error;
    } catch (error) {
      // Return mock account data
      return {
        balances: [
          { asset: 'USDT', free: '10000.00000000', locked: '0.00000000' },
          { asset: 'BTC', free: '0.25000000', locked: '0.00000000' },
          { asset: 'ETH', free: '5.50000000', locked: '0.00000000' }
        ]
      };
    }
  }

  async getExchangeInfo() {
    try {
      const data = await this.makeRequest('/exchangeInfo');
      return data.symbols.filter(symbol => 
        symbol.status === 'TRADING' && 
        symbol.symbol.endsWith('USDT')
      ).map(symbol => ({
        symbol: symbol.symbol,
        baseAsset: symbol.baseAsset,
        quoteAsset: symbol.quoteAsset,
        status: symbol.status
      }));
    } catch (error) {
      return [
        { symbol: 'BTCUSDT', baseAsset: 'BTC', quoteAsset: 'USDT', status: 'TRADING' },
        { symbol: 'ETHUSDT', baseAsset: 'ETH', quoteAsset: 'USDT', status: 'TRADING' },
        { symbol: 'BNBUSDT', baseAsset: 'BNB', quoteAsset: 'USDT', status: 'TRADING' }
      ];
    }
  }

  createWebSocketConnection(streams) {
    const streamString = Array.isArray(streams) ? streams.join('/') : streams;
    const ws = new WebSocket(`${this.wsURL}/${streamString}`);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };
    
    return ws;
  }

  subscribeToTicker(symbol, callback) {
    const stream = `${symbol.toLowerCase()}@ticker`;
    const ws = this.createWebSocketConnection(stream);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      callback({
        symbol: data.s,
        price: parseFloat(data.c),
        change: parseFloat(data.P),
        volume: parseFloat(data.v)
      });
    };
    
    return ws;
  }

  subscribeToKline(symbol, interval, callback) {
    const stream = `${symbol.toLowerCase()}@kline_${interval}`;
    const ws = this.createWebSocketConnection(stream);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const kline = data.k;
      callback({
        symbol: kline.s,
        openTime: kline.t,
        closeTime: kline.T,
        open: parseFloat(kline.o),
        high: parseFloat(kline.h),
        low: parseFloat(kline.l),
        close: parseFloat(kline.c),
        volume: parseFloat(kline.v),
        isFinal: kline.x
      });
    };
    
    return ws;
  }
}

export default new BinanceAPI();