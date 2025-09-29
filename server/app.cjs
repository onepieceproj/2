const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const http = require('http');
require('dotenv').config();

// Import services and middleware
const database = require('./config/database.cjs');
const WebSocketService = require('./services/websocket.cjs');
const SchedulerService = require('./services/scheduler.cjs');
const { generalLimiter, authLimiter, tradingLimiter, marketDataLimiter } = require('./middleware/rateLimiter.cjs');

// Import routes
const authRoutes = require('./routes/auth.cjs');
const signalRoutes = require('./routes/signals.cjs');
const portfolioRoutes = require('./routes/portfolio.cjs');
const tradeRoutes = require('./routes/trades.cjs');
const marketRoutes = require('./routes/market.cjs');
const aiRoutes = require('./routes/ai.cjs');
const settingsRoutes = require('./routes/settings.cjs');
const alertsRoutes = require('./routes/alerts.cjs');

class EnchantedTradingServer {
  constructor() {
    this.app = express();
    this.server = null;
    this.port = process.env.PORT || 5000;
  }

  async initialize() {
    try {
      // Initialize database
      await database.initialize();
      
      // Setup middleware
      this.setupMiddleware();
      
      // Setup routes
      this.setupRoutes();
      
      // Setup error handling
      this.setupErrorHandling();
      
      // Create HTTP server
      this.server = http.createServer(this.app);
      
      // Initialize WebSocket service
      WebSocketService.initialize(this.server);
      
      // Initialize scheduler
      SchedulerService.initialize();
      
      console.log('✅ Enchanted Trading Server initialized successfully');
      
    } catch (error) {
      console.error('❌ Server initialization failed:', error);
      process.exit(1);
    }
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "ws:", "wss:"],
        },
      },
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://your-frontend-domain.com'] 
        : ['http://localhost:3000', 'http://localhost:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Compression
    this.app.use(compression());

    // Logging
    this.app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Rate limiting
    this.app.use('/api/', generalLimiter);
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', async (req, res) => {
      try {
        const dbHealth = await database.healthCheck();
        const wsStats = WebSocketService.getStats();
        const schedulerStatus = SchedulerService.getJobStatus();
        
        res.json({
          success: true,
          timestamp: new Date().toISOString(),
          status: 'healthy',
          services: {
            database: dbHealth ? 'healthy' : 'unhealthy',
            websocket: 'healthy',
            scheduler: 'healthy'
          },
          stats: {
            websocket: wsStats,
            scheduler: schedulerStatus
          }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          status: 'unhealthy',
          error: error.message
        });
      }
    });

    // API routes with specific rate limiters
    this.app.use('/api/auth', authLimiter, authRoutes);
    this.app.use('/api/signals', tradingLimiter, signalRoutes);
    this.app.use('/api/portfolio', tradingLimiter, portfolioRoutes);
    this.app.use('/api/trades', tradingLimiter, tradeRoutes);
    this.app.use('/api/market', marketDataLimiter, marketRoutes);
    this.app.use('/api/ai', tradingLimiter, aiRoutes);
    this.app.use('/api/settings', generalLimiter, settingsRoutes);
    this.app.use('/api/alerts', generalLimiter, alertsRoutes);

    // API documentation endpoint
    this.app.get('/api', (req, res) => {
      res.json({
        success: true,
        message: 'Enchanted Trading API',
        version: '1.0.0',
        endpoints: {
          auth: '/api/auth',
          signals: '/api/signals',
          portfolio: '/api/portfolio',
          trades: '/api/trades',
          market: '/api/market'
        },
        websocket: '/ws',
        documentation: 'https://github.com/your-repo/api-docs'
      });
    });

    // Catch-all for undefined routes
    this.app.use('/api/*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        path: req.path
      });
    });

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'Enchanted Trading Server is running! ✨',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      });
    });
  }

  setupErrorHandling() {
    // Global error handler
    this.app.use((error, req, res, next) => {
      console.error('Global error handler:', error);
      
      // Don't leak error details in production
      const isDevelopment = process.env.NODE_ENV !== 'production';
      
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal server error',
        ...(isDevelopment && { stack: error.stack })
      });
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      this.gracefulShutdown();
    });

    // Handle termination signals
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      this.gracefulShutdown();
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully');
      this.gracefulShutdown();
    });
  }

  async start() {
    try {
      await this.initialize();
      
      this.server.listen(this.port, () => {
        console.log(`
🚀 Enchanted Trading Server is running!
📡 HTTP Server: http://localhost:${this.port}
🔌 WebSocket: ws://localhost:${this.port}/ws
🌟 Environment: ${process.env.NODE_ENV || 'development'}
        `);
      });
      
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  async gracefulShutdown() {
    console.log('🛑 Starting graceful shutdown...');
    
    try {
      // Stop accepting new connections
      if (this.server) {
        this.server.close(() => {
          console.log('✅ HTTP server closed');
        });
      }
      
      // Stop scheduler
      SchedulerService.stopAll();
      
      // Close WebSocket connections
      WebSocketService.cleanup();
      
      // Close database connections
      await database.close();
      
      console.log('✅ Graceful shutdown completed');
      process.exit(0);
      
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  }
}

// Create and start server
const server = new EnchantedTradingServer();
server.start();

module.exports = server;