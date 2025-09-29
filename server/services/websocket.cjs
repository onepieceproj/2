const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const MarketData = require('../models/MarketData.cjs');
const Signal = require('../models/Signal.cjs');

class WebSocketService {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // Store client connections with user info
    this.marketDataInterval = null;
    this.signalCheckInterval = null;
  }

  initialize(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/ws'
    });

    this.wss.on('connection', (ws, req) => {
      console.log('New WebSocket connection');
      
      // Handle authentication
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleMessage(ws, data);
        } catch (error) {
          console.error('WebSocket message error:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format'
          }));
        }
      });

      ws.on('close', () => {
        console.log('WebSocket connection closed');
        this.removeClient(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.removeClient(ws);
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'welcome',
        message: 'Connected to Enchanted Trading WebSocket'
      }));
    });

    // Start market data broadcasting
    this.startMarketDataBroadcast();
    
    // Start signal monitoring
    this.startSignalMonitoring();

    console.log('✅ WebSocket server initialized');
  }

  handleMessage(ws, data) {
    switch (data.type) {
      case 'auth':
        this.authenticateClient(ws, data.token);
        break;
      
      case 'subscribe':
        this.handleSubscription(ws, data);
        break;
      
      case 'unsubscribe':
        this.handleUnsubscription(ws, data);
        break;
      
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }));
        break;
      
      default:
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Unknown message type'
        }));
    }
  }

  authenticateClient(ws, token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const clientInfo = {
        ws,
        userId: decoded.userId,
        username: decoded.username,
        subscriptions: new Set(),
        authenticated: true,
        lastPing: Date.now()
      };

      this.clients.set(ws, clientInfo);
      
      ws.send(JSON.stringify({
        type: 'auth_success',
        message: 'Authentication successful',
        userId: decoded.userId
      }));

      console.log(`User ${decoded.username} authenticated via WebSocket`);
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'auth_error',
        message: 'Authentication failed'
      }));
    }
  }

  handleSubscription(ws, data) {
    const client = this.clients.get(ws);
    if (!client || !client.authenticated) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Authentication required'
      }));
      return;
    }

    const { channel, symbol } = data;
    const subscription = symbol ? `${channel}:${symbol}` : channel;
    
    client.subscriptions.add(subscription);
    
    ws.send(JSON.stringify({
      type: 'subscription_success',
      channel: subscription
    }));

    console.log(`User ${client.username} subscribed to ${subscription}`);
  }

  handleUnsubscription(ws, data) {
    const client = this.clients.get(ws);
    if (!client) return;

    const { channel, symbol } = data;
    const subscription = symbol ? `${channel}:${symbol}` : channel;
    
    client.subscriptions.delete(subscription);
    
    ws.send(JSON.stringify({
      type: 'unsubscription_success',
      channel: subscription
    }));
  }

  removeClient(ws) {
    this.clients.delete(ws);
  }

  broadcast(message, channel = null, userId = null) {
    this.clients.forEach((client, ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        // Check if client should receive this message
        let shouldSend = true;
        
        if (userId && client.userId !== userId) {
          shouldSend = false;
        }
        
        if (channel && !client.subscriptions.has(channel)) {
          shouldSend = false;
        }
        
        if (shouldSend) {
          ws.send(JSON.stringify(message));
        }
      }
    });
  }

  broadcastToUser(userId, message) {
    this.clients.forEach((client, ws) => {
      if (client.userId === userId && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }

  startMarketDataBroadcast() {
    // Broadcast market data every 5 seconds
    this.marketDataInterval = setInterval(async () => {
      try {
        const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT', 'DOTUSDT'];
        const marketData = await MarketData.getLatestPrices(symbols);
        
        // Add some random price movements for demo
        const updatedData = marketData.map(data => ({
          ...data,
          price: data.price * (1 + (Math.random() - 0.5) * 0.001), // ±0.05% random movement
          timestamp: new Date().toISOString()
        }));

        this.broadcast({
          type: 'market_data',
          data: updatedData
        }, 'market_data');

        // Broadcast individual symbol updates
        updatedData.forEach(symbolData => {
          this.broadcast({
            type: 'price_update',
            symbol: symbolData.symbol,
            data: symbolData
          }, `price:${symbolData.symbol}`);
        });

      } catch (error) {
        console.error('Market data broadcast error:', error);
      }
    }, 5000);
  }

  startSignalMonitoring() {
    // Check for new signals every 30 seconds
    this.signalCheckInterval = setInterval(async () => {
      try {
        const activeSignals = await Signal.findActive(10);
        
        this.broadcast({
          type: 'signals_update',
          data: activeSignals
        }, 'signals');

      } catch (error) {
        console.error('Signal monitoring error:', error);
      }
    }, 30000);
  }

  // Send notification to specific user
  sendNotification(userId, notification) {
    this.broadcastToUser(userId, {
      type: 'notification',
      data: notification
    });
  }

  // Send trade update to user
  sendTradeUpdate(userId, trade) {
    this.broadcastToUser(userId, {
      type: 'trade_update',
      data: trade
    });
  }

  // Send signal alert to subscribed users
  sendSignalAlert(signal) {
    this.broadcast({
      type: 'signal_alert',
      data: signal
    }, 'signals');
  }

  // Send portfolio update to user
  sendPortfolioUpdate(userId, portfolio) {
    this.broadcastToUser(userId, {
      type: 'portfolio_update',
      data: portfolio
    });
  }

  // Cleanup method
  cleanup() {
    if (this.marketDataInterval) {
      clearInterval(this.marketDataInterval);
    }
    
    if (this.signalCheckInterval) {
      clearInterval(this.signalCheckInterval);
    }
    
    if (this.wss) {
      this.wss.close();
    }
  }

  // Get connection statistics
  getStats() {
    const totalConnections = this.clients.size;
    const authenticatedConnections = Array.from(this.clients.values())
      .filter(client => client.authenticated).length;
    
    const subscriptionCounts = {};
    this.clients.forEach(client => {
      client.subscriptions.forEach(sub => {
        subscriptionCounts[sub] = (subscriptionCounts[sub] || 0) + 1;
      });
    });

    return {
      totalConnections,
      authenticatedConnections,
      subscriptionCounts
    };
  }
}

module.exports = new WebSocketService();