const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class Database {
  constructor() {
    this.pool = null;
    this.config = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'enchanted_trading',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4'
    };
  }

  async initialize() {
    try {
      // Create connection pool
      this.pool = mysql.createPool(this.config);
      
      // Test the connection
      const connection = await this.pool.getConnection();
      console.log('✅ Database connected successfully');
      
      // Release the test connection
      connection.release();
      
      // Check if database exists and has tables
      await this.ensureDatabaseSetup();
      
      return this.pool;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      
      // Try to create database if it doesn't exist
      if (error.code === 'ER_BAD_DB_ERROR') {
        await this.createDatabase();
        return this.initialize();
      }
      
      throw error;
    }
  }

  async ensureDatabaseSetup() {
    try {
      // Check if users table exists
      const [tables] = await this.pool.execute(
        "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = 'users'",
        [this.config.database]
      );
      
      if (tables[0].count === 0) {
        console.log('📋 Database tables not found, creating schema...');
        await this.createSchema();
      } else {
        console.log('✅ Database schema already exists');
        // Clean any existing demo data
        await this.cleanDemoData();
      }
    } catch (error) {
      console.error('❌ Error checking database schema:', error.message);
      throw error;
    }
  }

  async createSchema() {
    try {
      // Create tables directly without relying on external schema files
      await this.createTables();
      console.log('✅ Database schema created successfully');
    } catch (error) {
      console.error('❌ Error creating database schema:', error.message);
      throw error;
    }
  }

  async createTables() {
    const tables = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(50) NULL,
        last_name VARCHAR(50) NULL,
        phone VARCHAR(20) NULL,
        location VARCHAR(100) NULL,
        bio TEXT NULL,
        trading_experience ENUM('Beginner', '1-2 years', '3+ years', 'Expert') DEFAULT 'Beginner',
        risk_tolerance ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
        preferred_markets JSON,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_username (username)
      )`,

      // Portfolio table
      `CREATE TABLE IF NOT EXISTS portfolio (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        total_balance DECIMAL(20, 8) DEFAULT 0.00,
        available_balance DECIMAL(20, 8) DEFAULT 0.00,
        locked_balance DECIMAL(20, 8) DEFAULT 0.00,
        total_pnl DECIMAL(20, 8) DEFAULT 0.00,
        daily_pnl DECIMAL(20, 8) DEFAULT 0.00,
        total_trades INT DEFAULT 0,
        winning_trades INT DEFAULT 0,
        win_rate DECIMAL(5, 2) DEFAULT 0.00,
        max_drawdown DECIMAL(5, 2) DEFAULT 0.00,
        sharpe_ratio DECIMAL(5, 2) DEFAULT 0.00,
        active_positions INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id)
      )`,

      // Holdings table
      `CREATE TABLE IF NOT EXISTS holdings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        symbol VARCHAR(20) NOT NULL,
        asset_name VARCHAR(50),
        quantity DECIMAL(20, 8) NOT NULL DEFAULT 0,
        avg_price DECIMAL(20, 8) NOT NULL,
        market_value DECIMAL(20, 8) GENERATED ALWAYS AS (quantity * avg_price) STORED,
        unrealized_pnl DECIMAL(20, 8) DEFAULT 0.00,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_symbol (user_id, symbol),
        INDEX idx_user_symbol (user_id, symbol)
      )`,

      // Signals table
      `CREATE TABLE IF NOT EXISTS signals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        pair VARCHAR(20) NOT NULL,
        type ENUM('BUY', 'SELL', 'HOLD') NOT NULL,
        price DECIMAL(20, 8) NOT NULL,
        confidence DECIMAL(5, 2) NOT NULL,
        timeframe VARCHAR(10) NOT NULL,
        indicators JSON,
        technical_analysis JSON,
        risk_reward_ratio DECIMAL(5, 2),
        stop_loss DECIMAL(20, 8),
        take_profit DECIMAL(20, 8),
        status ENUM('ACTIVE', 'EXECUTED', 'EXPIRED', 'CANCELLED') DEFAULT 'ACTIVE',
        expires_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_pair (user_id, pair),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      )`,

      // Trades table
      `CREATE TABLE IF NOT EXISTS trades (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        signal_id INT,
        trade_id VARCHAR(50) UNIQUE,
        pair VARCHAR(20) NOT NULL,
        side ENUM('BUY', 'SELL') NOT NULL,
        type ENUM('MARKET', 'LIMIT', 'STOP_LOSS', 'TAKE_PROFIT') DEFAULT 'MARKET',
        quantity DECIMAL(20, 8) NOT NULL,
        entry_price DECIMAL(20, 8) NOT NULL,
        exit_price DECIMAL(20, 8),
        stop_loss DECIMAL(20, 8),
        take_profit DECIMAL(20, 8),
        fees DECIMAL(20, 8) DEFAULT 0.00,
        realized_pnl DECIMAL(20, 8) DEFAULT 0.00,
        pnl_percentage DECIMAL(8, 4) DEFAULT 0.00,
        status ENUM('OPEN', 'CLOSED', 'CANCELLED') DEFAULT 'OPEN',
        close_time TIMESTAMP NULL,
        duration_minutes INT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (signal_id) REFERENCES signals(id) ON DELETE SET NULL,
        INDEX idx_user_id (user_id),
        INDEX idx_pair (pair),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      )`,

      // Market data table
      `CREATE TABLE IF NOT EXISTS market_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        symbol VARCHAR(20) NOT NULL,
        price DECIMAL(20, 8) NOT NULL,
        volume DECIMAL(20, 8) DEFAULT 0,
        high_24h DECIMAL(20, 8) DEFAULT 0,
        low_24h DECIMAL(20, 8) DEFAULT 0,
        change_24h DECIMAL(20, 8) DEFAULT 0,
        change_percentage_24h DECIMAL(8, 4) DEFAULT 0,
        market_cap DECIMAL(30, 8) DEFAULT 0,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_symbol (symbol),
        INDEX idx_timestamp (timestamp),
        INDEX idx_symbol_timestamp (symbol, timestamp)
      )`,

      // Technical indicators table
      `CREATE TABLE IF NOT EXISTS technical_indicators (
        id INT AUTO_INCREMENT PRIMARY KEY,
        symbol VARCHAR(20) NOT NULL,
        timeframe VARCHAR(10) NOT NULL,
        rsi DECIMAL(8, 4),
        macd DECIMAL(12, 8),
        macd_signal DECIMAL(12, 8),
        macd_histogram DECIMAL(12, 8),
        sma_20 DECIMAL(20, 8),
        sma_50 DECIMAL(20, 8),
        sma_200 DECIMAL(20, 8),
        ema_12 DECIMAL(20, 8),
        ema_26 DECIMAL(20, 8),
        bollinger_upper DECIMAL(20, 8),
        bollinger_middle DECIMAL(20, 8),
        bollinger_lower DECIMAL(20, 8),
        volume_sma DECIMAL(20, 8),
        atr DECIMAL(20, 8),
        stochastic_k DECIMAL(8, 4),
        stochastic_d DECIMAL(8, 4),
        williams_r DECIMAL(8, 4),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_symbol_timeframe (symbol, timeframe),
        INDEX idx_symbol (symbol),
        INDEX idx_timeframe (timeframe)
      )`,

      // Price alerts table
      `CREATE TABLE IF NOT EXISTS price_alerts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        symbol VARCHAR(20) NOT NULL,
        alert_type ENUM('PRICE_ABOVE', 'PRICE_BELOW', 'VOLUME_SPIKE', 'RSI_OVERBOUGHT', 'RSI_OVERSOLD') NOT NULL,
        target_value DECIMAL(20, 8) NOT NULL,
        current_value DECIMAL(20, 8),
        is_triggered BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        triggered_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_symbol (user_id, symbol),
        INDEX idx_active (is_active)
      )`,

      // User settings table
      `CREATE TABLE IF NOT EXISTS user_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        binance_api_key VARCHAR(255),
        binance_secret_key VARCHAR(255),
        testnet_mode BOOLEAN DEFAULT FALSE,
        email_notifications BOOLEAN DEFAULT TRUE,
        push_notifications BOOLEAN DEFAULT TRUE,
        sound_alerts BOOLEAN DEFAULT TRUE,
        default_risk_percentage DECIMAL(5, 2) DEFAULT 2.00,
        max_positions INT DEFAULT 5,
        auto_trade BOOLEAN DEFAULT FALSE,
        dark_mode BOOLEAN DEFAULT TRUE,
        language VARCHAR(10) DEFAULT 'en',
        currency VARCHAR(10) DEFAULT 'USD',
        timezone VARCHAR(50) DEFAULT 'UTC',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_settings (user_id)
      )`,

      // Notifications table
      `CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type ENUM('SIGNAL', 'TRADE', 'PRICE_ALERT', 'SYSTEM') NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_created_at (created_at)
      )`,

      // Backtesting results table
      `CREATE TABLE IF NOT EXISTS backtesting_results (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        strategy_name VARCHAR(100) NOT NULL,
        symbol VARCHAR(20) NOT NULL,
        timeframe VARCHAR(10) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        initial_capital DECIMAL(20, 8) NOT NULL,
        final_capital DECIMAL(20, 8) NOT NULL,
        total_return DECIMAL(20, 8) NOT NULL,
        return_percentage DECIMAL(8, 4) NOT NULL,
        total_trades INT NOT NULL,
        winning_trades INT NOT NULL,
        losing_trades INT NOT NULL,
        win_rate DECIMAL(5, 2) NOT NULL,
        max_drawdown DECIMAL(8, 4) NOT NULL,
        sharpe_ratio DECIMAL(8, 4),
        profit_factor DECIMAL(8, 4),
        avg_win DECIMAL(20, 8),
        avg_loss DECIMAL(20, 8),
        largest_win DECIMAL(20, 8),
        largest_loss DECIMAL(20, 8),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_symbol (symbol)
      )`
    ];

    for (const tableSQL of tables) {
      try {
        await this.pool.execute(tableSQL);
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.error('Error creating table:', error.message);
          throw error;
        }
      }
    }
  }

  async cleanDemoData() {
    try {
      console.log('🧹 Cleaning demo data...');
      
      // Remove demo users (keep only real registered users)
      await this.pool.execute(`
        DELETE FROM users 
        WHERE email IN ('admin@enchantedtrading.com', 'demo@example.com') 
        OR username IN ('admin', 'demo_user')
      `);
      
      // Clean market data older than 1 day
      await this.pool.execute(`
        DELETE FROM market_data 
        WHERE timestamp < DATE_SUB(NOW(), INTERVAL 1 DAY)
      `);
      
      // Clean technical indicators older than 1 day
      await this.pool.execute(`
        DELETE FROM technical_indicators 
        WHERE timestamp < DATE_SUB(NOW(), INTERVAL 1 DAY)
      `);
      
      console.log('✅ Demo data cleaned successfully');
    } catch (error) {
      console.error('Error cleaning demo data:', error);
    }
  }

  async createDatabase() {
    try {
      const tempConfig = { ...this.config };
      delete tempConfig.database;
      
      const tempPool = mysql.createPool(tempConfig);
      const connection = await tempPool.getConnection();
      
      await connection.execute(`CREATE DATABASE IF NOT EXISTS ${this.config.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      console.log(`✅ Database '${this.config.database}' created successfully`);
      
      connection.release();
      await tempPool.end();
    } catch (error) {
      console.error('❌ Failed to create database:', error.message);
      throw error;
    }
  }

  async query(sql, params = []) {
    try {
      const [rows] = await this.pool.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('Database query error:', error.message);
      console.error('SQL:', sql);
      console.error('Params:', params);
      throw error;
    }
  }

  async transaction(callback) {
    const connection = await this.pool.getConnection();
    
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('✅ Database connection closed');
    }
  }

  // Health check method
  async healthCheck() {
    try {
      const [rows] = await this.pool.execute('SELECT 1 as health');
      return rows[0].health === 1;
    } catch (error) {
      console.error('Database health check failed:', error.message);
      return false;
    }
  }

  // Get connection for advanced operations
  async getConnection() {
    return await this.pool.getConnection();
  }
}

// Create singleton instance
const database = new Database();

module.exports = database;