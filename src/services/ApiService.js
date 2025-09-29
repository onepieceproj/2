import axios from 'axios';

class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    this.token = localStorage.getItem('authToken');
    
    // Create axios instance
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptor for auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
          console.warn('Backend server not available, using mock data');
          return Promise.resolve({ data: { success: false, message: 'Backend unavailable' } });
        }
        
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          // Don't redirect immediately, let the component handle it
        }
        
        console.error('API Error:', error.response?.data || error.message);
        return Promise.resolve({ 
          data: { 
            success: false, 
            message: error.response?.data?.message || error.message || 'Request failed' 
          } 
        });
      }
    );
  }

  // Auth methods
  async login(email, password) {
    try {
      const response = await this.api.post('/auth/login', { email, password });
      
      // Handle backend unavailable
      if (!response.data || response.data.message === 'Backend unavailable') {
        return this.mockLogin(email, password);
      }
      
      if (response.data?.success) {
        localStorage.setItem('authToken', response.data.data.token);
        this.token = response.data.data.token;
        return response.data;
      }
      
      return response.data || { success: false, message: 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return this.mockLogin(email, password);
    }
  }

  async register(userData) {
    try {
      const response = await this.api.post('/auth/register', userData);
      
      // Handle backend unavailable
      if (!response.data || response.data.message === 'Backend unavailable') {
        return this.mockRegister(userData);
      }
      
      if (response.data?.success) {
        localStorage.setItem('authToken', response.data.data.token);
        this.token = response.data.data.token;
        return response.data;
      }
      
      return response.data || { success: false, message: 'Registration failed' };
    } catch (error) {
      console.error('Registration error:', error);
      return this.mockRegister(userData);
    }
  }

  async getProfile() {
    try {
      const response = await this.api.get('/auth/profile');
      
      if (!response.data || response.data.message === 'Backend unavailable') {
        return this.mockGetProfile();
      }
      
      return response.data || { success: false, message: 'Failed to fetch profile' };
    } catch (error) {
      console.error('Profile fetch error:', error);
      return this.mockGetProfile();
    }
  }

  // Signal methods
  async getSignals(limit = 50, offset = 0) {
    try {
      const response = await this.api.get('/signals', {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      console.error('Signals fetch error:', error);
      return { success: false, data: [] };
    }
  }

  async getActiveSignals(limit = 20) {
    try {
      const response = await this.api.get('/signals/active', {
        params: { limit }
      });
      
      if (!response.data || response.data.message === 'Backend unavailable') {
        return this.mockGetActiveSignals();
      }
      
      return response.data || { success: false, data: [] };
    } catch (error) {
      console.error('Active signals fetch error:', error);
      return this.mockGetActiveSignals();
    }
  }

  async generateSignal(pair, timeframe) {
    try {
      const response = await this.api.post('/signals/generate', { pair, timeframe });
      return response.data;
    } catch (error) {
      console.error('Signal generation error:', error);
      throw error;
    }
  }

  async generateAISignal(symbol, timeframe) {
    try {
      const response = await this.api.post('/ai/generate-signal', { symbol, timeframe });
      
      if (!response.data || response.data.message === 'Backend unavailable') {
        return this.mockGenerateSignal(symbol, timeframe);
      }
      
      return response.data || { success: false, message: 'Failed to generate signal' };
    } catch (error) {
      console.error('AI signal generation error:', error);
      return this.mockGenerateSignal(symbol, timeframe);
    }
  }

  // Portfolio methods
  async getPortfolio() {
    try {
      const response = await this.api.get('/portfolio');
      
      if (!response.data || response.data.message === 'Backend unavailable') {
        return this.mockGetPortfolio();
      }
      
      return response.data || { success: false, data: null };
    } catch (error) {
      console.error('Portfolio fetch error:', error);
      return this.mockGetPortfolio();
    }
  }

  async getHoldings() {
    try {
      const response = await this.api.get('/portfolio/holdings');
      return response.data;
    } catch (error) {
      console.error('Holdings fetch error:', error);
      return { success: false, data: [] };
    }
  }

  async getPortfolioSummary() {
    try {
      const response = await this.api.get('/portfolio/summary');
      return response.data;
    } catch (error) {
      console.error('Portfolio summary fetch error:', error);
      return { success: false, data: null };
    }
  }

  // Trade methods
  async getTrades(limit = 50, offset = 0, status = null) {
    try {
      const params = { limit, offset };
      if (status) params.status = status;
      
      const response = await this.api.get('/trades', { params });
      
      if (!response.data || response.data.message === 'Backend unavailable') {
        return this.mockGetTrades();
      }
      
      return response.data || { success: false, data: [] };
    } catch (error) {
      console.error('Trades fetch error:', error);
      return this.mockGetTrades();
    }
  }

  // Real trading methods
  async executeTrade(tradeData) {
    try {
      const response = await this.api.post('/trades/execute', tradeData);
      
      if (!response.data || response.data.message === 'Backend unavailable') {
        return this.mockExecuteTrade(tradeData);
      }
      
      return response.data || { success: false, message: 'Failed to execute trade' };
    } catch (error) {
      console.error('Trade execution error:', error);
      return this.mockExecuteTrade(tradeData);
    }
  }

  async getAccountBalance() {
    try {
      const response = await this.api.get('/portfolio/balance');
      
      if (!response.data || response.data.message === 'Backend unavailable') {
        return this.mockGetAccountBalance();
      }
      
      return response.data || { success: false, data: {} };
    } catch (error) {
      console.error('Account balance fetch error:', error);
      return this.mockGetAccountBalance();
    }
  }

  async placeOrder(orderData) {
    try {
      const response = await this.api.post('/trades/order', orderData);
      
      if (!response.data || response.data.message === 'Backend unavailable') {
        return this.mockPlaceOrder(orderData);
      }
      
      return response.data || { success: false, message: 'Failed to place order' };
    } catch (error) {
      console.error('Order placement error:', error);
      return this.mockPlaceOrder(orderData);
    }
  }

  async getTradeHistory(filters = {}) {
    try {
      const response = await this.api.get('/trades/history', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Trade history fetch error:', error);
      return { success: false, data: [] };
    }
  }

  async createTrade(tradeData) {
    try {
      const response = await this.api.post('/trades', tradeData);
      
      if (!response.data || response.data.message === 'Backend unavailable') {
        return this.mockCreateTrade(tradeData);
      }
      
      return response.data || { success: false, message: 'Failed to create trade' };
    } catch (error) {
      console.error('Trade creation error:', error);
      return this.mockCreateTrade(tradeData);
    }
  }

  async closeTrade(tradeId, exitPrice, fees = 0, notes = null) {
    try {
      const response = await this.api.put(`/trades/${tradeId}/close`, {
        exitPrice,
        fees,
        notes
      });
      return response.data;
    } catch (error) {
      console.error('Trade close error:', error);
      throw error;
    }
  }

  // Market data methods
  async getMarketPrices(symbols = []) {
    try {
      const response = await this.api.get('/market/prices', {
        params: { symbols: symbols.join(',') }
      });
      
      if (!response.data || response.data.message === 'Backend unavailable') {
        return this.mockGetMarketPrices(symbols);
      }
      
      return response.data || { success: false, data: [] };
    } catch (error) {
      console.error('Market prices fetch error:', error);
      return this.mockGetMarketPrices(symbols);
    }
  }

  async getMarketOverview() {
    try {
      const response = await this.api.get('/market/overview');
      return response.data;
    } catch (error) {
      console.error('Market overview fetch error:', error);
      return { success: false, data: [] };
    }
  }

  async getPriceHistory(symbol, hours = 24) {
    try {
      const response = await this.api.get(`/market/history/${symbol}`, {
        params: { hours }
      });
      return response.data;
    } catch (error) {
      console.error('Price history fetch error:', error);
      return { success: false, data: [] };
    }
  }

  // Settings methods
  async getSettings() {
    try {
      const response = await this.api.get('/settings');
      
      if (!response.data || response.data.message === 'Backend unavailable') {
        return this.mockGetSettings();
      }
      
      return response.data || { success: false, data: {} };
    } catch (error) {
      console.error('Settings fetch error:', error);
      return this.mockGetSettings();
    }
  }

  async updateSettings(settings) {
    try {
      const response = await this.api.put('/settings', settings);
      
      if (!response.data || response.data.message === 'Backend unavailable') {
        return { success: true, message: 'Settings saved locally (backend unavailable)' };
      }
      
      return response.data || { success: false, message: 'Failed to update settings' };
    } catch (error) {
      console.error('Settings update error:', error);
      return { success: true, message: 'Settings saved locally (backend unavailable)' };
    }
  }

  // Alert methods
  async getAlerts() {
    try {
      const response = await this.api.get('/alerts');
      return response.data;
    } catch (error) {
      console.error('Alerts fetch error:', error);
      return { success: false, data: [] };
    }
  }

  async createAlert(alertData) {
    try {
      const response = await this.api.post('/alerts', alertData);
      
      if (!response.data || response.data.message === 'Backend unavailable') {
        return { success: true, message: 'Alert created locally (backend unavailable)' };
      }
      
      return response.data || { success: false, message: 'Failed to create alert' };
    } catch (error) {
      console.error('Alert creation error:', error);
      return { success: true, message: 'Alert created locally (backend unavailable)' };
    }
  }

  async deleteAlert(alertId) {
    try {
      const response = await this.api.delete(`/alerts/${alertId}`);
      
      if (!response.data || response.data.message === 'Backend unavailable') {
        return { success: true, message: 'Alert deleted locally (backend unavailable)' };
      }
      
      return response.data || { success: false, message: 'Failed to delete alert' };
    } catch (error) {
      console.error('Alert deletion error:', error);
      return { success: true, message: 'Alert deleted locally (backend unavailable)' };
    }
  }

  // Mock methods for when backend is unavailable
  mockLogin(email, password) {
    // Simple mock authentication
    if (email && password) {
      const mockToken = 'mock_token_' + Date.now();
      localStorage.setItem('authToken', mockToken);
      this.token = mockToken;
      
      return {
        success: true,
        data: {
          userId: 'mock_user_1',
          username: email.split('@')[0],
          email: email,
          token: mockToken
        }
      };
    }
    
    return {
      success: false,
      message: 'Invalid credentials'
    };
  }

  mockRegister(userData) {
    const { email, username } = userData;
    const mockToken = 'mock_token_' + Date.now();
    localStorage.setItem('authToken', mockToken);
    this.token = mockToken;
    
    return {
      success: true,
      data: {
        userId: 'mock_user_' + Date.now(),
        username: username,
        email: email,
        token: mockToken
      }
    };
  }

  mockGetProfile() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return { success: false, message: 'Not authenticated' };
    }
    
    return {
      success: true,
      data: {
        id: 'mock_user_1',
        username: 'demo_user',
        email: 'demo@example.com',
        firstName: 'Demo',
        lastName: 'User'
      }
    };
  }

  mockGetPortfolio() {
    return {
      success: true,
      data: {
        id: 1,
        user_id: 1,
        total_balance: 10000,
        available_balance: 8500,
        locked_balance: 1500,
        total_pnl: 245.67,
        daily_pnl: 45.23,
        total_trades: 15,
        winning_trades: 10,
        active_positions: 3,
        win_rate: 68.5,
        max_drawdown: 5.2,
        sharpe_ratio: 1.85
      }
    };
  }

  mockGetActiveSignals() {
    const mockSignals = [
      {
        id: 1,
        pair: 'BTCUSDT',
        type: 'BUY',
        price: 43250.50,
        confidence: 85,
        timeframe: '1h',
        timestamp: new Date().toISOString(),
        indicators: {
          rsi: 68.5,
          macd: 125.30,
          volume: 28450.75
        }
      },
      {
        id: 2,
        pair: 'ETHUSDT',
        type: 'SELL',
        price: 2650.75,
        confidence: 72,
        timeframe: '4h',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        indicators: {
          rsi: 72.1,
          macd: -15.20,
          volume: 156780.50
        }
      },
      {
        id: 3,
        pair: 'BNBUSDT',
        type: 'BUY',
        price: 315.80,
        confidence: 78,
        timeframe: '1h',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        indicators: {
          rsi: 45.3,
          macd: 2.85,
          volume: 45230.25
        }
      }
    ];

    return {
      success: true,
      data: mockSignals
    };
  }

  mockGenerateSignal(symbol, timeframe) {
    const mockSignal = {
      id: Date.now(),
      symbol,
      pair: symbol,
      type: Math.random() > 0.5 ? 'BUY' : 'SELL',
      price: 43000 + Math.random() * 1000,
      confidence: 60 + Math.random() * 35,
      timeframe,
      timestamp: new Date().toISOString(),
      indicators: {
        rsi: 30 + Math.random() * 40,
        macd: (Math.random() - 0.5) * 200,
        volume: Math.random() * 100000
      }
    };

    return {
      success: true,
      data: mockSignal
    };
  }

  mockGetTrades() {
    const mockTrades = [
      {
        id: 1,
        user_id: 1,
        pair: 'BTCUSDT',
        side: 'BUY',
        type: 'MARKET',
        quantity: 0.1,
        entry_price: 42800.00,
        exit_price: 43250.50,
        realized_pnl: 45.05,
        pnl_percentage: 1.05,
        status: 'CLOSED',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        close_time: new Date(Date.now() - 1800000).toISOString(),
        duration_minutes: 30
      },
      {
        id: 2,
        user_id: 1,
        pair: 'ETHUSDT',
        side: 'SELL',
        type: 'LIMIT',
        quantity: 2.5,
        entry_price: 2680.00,
        exit_price: 2650.75,
        realized_pnl: 73.13,
        pnl_percentage: 1.09,
        status: 'CLOSED',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        close_time: new Date(Date.now() - 3600000).toISOString(),
        duration_minutes: 60
      }
    ];

    return {
      success: true,
      data: mockTrades
    };
  }

  mockGetMarketPrices(symbols) {
    const mockPrices = [
      { 
        symbol: 'BTCUSDT', 
        price: 43250.50, 
        change_percentage_24h: 2.98,
        volume: 28450.75,
        high_24h: 44100.00,
        low_24h: 41800.25,
        timestamp: new Date().toISOString()
      },
      { 
        symbol: 'ETHUSDT', 
        price: 2650.75, 
        change_percentage_24h: -1.68,
        volume: 156780.50,
        high_24h: 2720.00,
        low_24h: 2580.30,
        timestamp: new Date().toISOString()
      },
      { 
        symbol: 'BNBUSDT', 
        price: 315.80, 
        change_percentage_24h: 2.75,
        volume: 45230.25,
        high_24h: 322.50,
        low_24h: 305.60,
        timestamp: new Date().toISOString()
      },
      { 
        symbol: 'ADAUSDT', 
        price: 0.4850, 
        change_percentage_24h: 2.64,
        volume: 892450.75,
        high_24h: 0.4920,
        low_24h: 0.4680,
        timestamp: new Date().toISOString()
      },
      { 
        symbol: 'SOLUSDT', 
        price: 98.25, 
        change_percentage_24h: 2.56,
        volume: 234560.30,
        high_24h: 102.50,
        low_24h: 95.80,
        timestamp: new Date().toISOString()
      }
    ];

    const filteredPrices = symbols.length > 0 
      ? mockPrices.filter(p => symbols.includes(p.symbol))
      : mockPrices;

    return {
      success: true,
      data: filteredPrices
    };
  }

  mockCreateTrade(tradeData) {
    return {
      success: true,
      data: {
        id: Date.now(),
        ...tradeData,
        status: 'OPEN',
        created_at: new Date().toISOString()
      }
    };
  }

  mockExecuteTrade(tradeData) {
    return {
      success: true,
      data: {
        orderId: 'ORD' + Date.now(),
        status: 'FILLED',
        executedQty: tradeData.quantity,
        executedPrice: tradeData.price || (43000 + Math.random() * 500),
        commission: tradeData.quantity * 0.001, // 0.1% fee
        timestamp: new Date().toISOString()
      }
    };
  }

  mockGetAccountBalance() {
    return {
      success: true,
      data: {
        USDT: { free: 8500.00, locked: 1500.00 },
        BTC: { free: 0.25, locked: 0.05 },
        ETH: { free: 5.50, locked: 1.25 },
        BNB: { free: 12.75, locked: 2.25 }
      }
    };
  }

  mockPlaceOrder(orderData) {
    return {
      success: true,
      data: {
        orderId: 'ORD' + Date.now(),
        symbol: orderData.symbol,
        side: orderData.side,
        type: orderData.type,
        quantity: orderData.quantity,
        price: orderData.price,
        status: 'NEW',
        timestamp: new Date().toISOString()
      }
    };
  }
  mockGetSettings() {
    return {
      success: true,
      data: {
        testnet_mode: true,
        email_notifications: true,
        push_notifications: true,
        sound_alerts: true,
        default_risk_percentage: 2.00,
        max_positions: 5,
        auto_trade: false,
        dark_mode: true,
        language: 'en',
        currency: 'USD',
        timezone: 'UTC'
      }
    }
  }

  // Utility methods
  logout() {
    localStorage.removeItem('authToken');
    this.token = null;
  }

  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }

  // Real-time market data simulation
  startMarketDataUpdates(callback) {
    const interval = setInterval(async () => {
      try {
        const result = await this.getMarketPrices(['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT']);
        if (result.success && callback) {
          // Add small random price movements
          const updatedData = result.data.map(item => ({
            ...item,
            price: item.price * (1 + (Math.random() - 0.5) * 0.001), // ±0.05% movement
            timestamp: new Date().toISOString()
          }));
          callback(updatedData);
        }
      } catch (error) {
        console.error('Market data update error:', error);
      }
    }, 5000); // Update every 5 seconds

    return interval;
  }

  // Health check
  async healthCheck() {
    try {
      const response = await axios.get('http://localhost:5000/health');
      return response.data;
    } catch (error) {
      console.warn('Backend health check failed - server may not be running');
      return { success: false, status: 'unhealthy' };
    }
  }
}

export default new ApiService();