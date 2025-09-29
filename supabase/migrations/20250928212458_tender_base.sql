-- Enchanted Trading Platform Database Schema
-- MySQL 8.0+ Compatible

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS enchanted_trading CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE enchanted_trading;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    phone VARCHAR(20),
    location VARCHAR(100),
    bio TEXT,
    trading_experience ENUM('Beginner', '1-2 years', '3+ years', 'Expert') DEFAULT 'Beginner',
    risk_tolerance ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
    preferred_markets JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
);

-- Portfolio table
CREATE TABLE IF NOT EXISTS portfolio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_balance DECIMAL(20, 8) DEFAULT 10000.00,
    available_balance DECIMAL(20, 8) DEFAULT 10000.00,
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
);

-- Holdings table
CREATE TABLE IF NOT EXISTS holdings (
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
);

-- Signals table
CREATE TABLE IF NOT EXISTS signals (
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
);

-- Trades table
CREATE TABLE IF NOT EXISTS trades (
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
);

-- Market data table
CREATE TABLE IF NOT EXISTS market_data (
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
);

-- Technical indicators table
CREATE TABLE IF NOT EXISTS technical_indicators (
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
);

-- Price alerts table
CREATE TABLE IF NOT EXISTS price_alerts (
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
);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    binance_api_key VARCHAR(255),
    binance_secret_key VARCHAR(255),
    testnet_mode BOOLEAN DEFAULT TRUE,
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
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
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
);

-- Backtesting results table
CREATE TABLE IF NOT EXISTS backtesting_results (
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
);

-- Insert default admin user
INSERT IGNORE INTO users (
    username, email, password_hash, first_name, last_name, 
    trading_experience, risk_tolerance, preferred_markets
) VALUES (
    'admin', 
    'admin@enchantedtrading.com', 
    '$2b$10$rOzJqQqZQqZQqZQqZQqZQOzJqQqZQqZQqZQqZQqZQqZQqZQqZQqZQ', -- password: 'password'
    'Admin', 
    'User',
    'Expert',
    'Medium',
    '["Spot", "Futures", "Options"]'
);

-- Insert default portfolio for admin user
INSERT IGNORE INTO portfolio (user_id, total_balance, available_balance) 
SELECT id, 10000.00, 10000.00 FROM users WHERE username = 'admin';

-- Insert default settings for admin user
INSERT IGNORE INTO user_settings (user_id) 
SELECT id FROM users WHERE username = 'admin';

-- Insert sample market data
INSERT IGNORE INTO market_data (symbol, price, volume, high_24h, low_24h, change_24h, change_percentage_24h, market_cap) VALUES
('BTCUSDT', 43250.50, 28450.75, 44100.00, 41800.25, 1250.30, 2.98, 850000000000),
('ETHUSDT', 2650.75, 156780.50, 2720.00, 2580.30, -45.20, -1.68, 320000000000),
('BNBUSDT', 315.80, 45230.25, 322.50, 305.60, 8.45, 2.75, 48000000000),
('ADAUSDT', 0.4850, 892450.75, 0.4920, 0.4680, 0.0125, 2.64, 17000000000),
('SOLUSDT', 98.25, 234560.30, 102.50, 95.80, 2.45, 2.56, 42000000000),
('DOTUSDT', 7.25, 123450.60, 7.58, 7.05, -0.18, -2.42, 9500000000);

-- Insert sample technical indicators
INSERT IGNORE INTO technical_indicators (symbol, timeframe, rsi, macd, sma_20, sma_50, ema_12, ema_26) VALUES
('BTCUSDT', '1h', 68.5, 125.30, 42800.00, 41200.00, 43100.00, 42500.00),
('ETHUSDT', '1h', 72.1, -15.20, 2650.00, 2580.00, 2665.00, 2640.00),
('BNBUSDT', '1h', 45.3, 2.85, 315.00, 310.00, 316.50, 314.20),
('ADAUSDT', '1h', 82.7, 0.0025, 0.48, 0.45, 0.486, 0.478);