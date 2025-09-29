# Database Setup Guide

This guide will help you set up the MySQL database for the Enchanted Trading platform.

## Prerequisites

- MySQL 8.0 or higher
- MySQL client or MySQL Workbench
- Administrative access to MySQL server

## Quick Setup

### 1. Create Database
```sql
CREATE DATABASE enchanted_trading CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Import Schema
```bash
mysql -u root -p enchanted_trading < server/database/schema.sql
```

### 3. Verify Installation
```sql
USE enchanted_trading;
SHOW TABLES;
```

You should see the following tables:
- users
- signals
- portfolio
- holdings
- trades
- market_data
- technical_indicators
- price_alerts
- user_settings
- backtesting_results
- notifications

## Manual Setup

If you prefer to set up the database manually:

### 1. Connect to MySQL
```bash
mysql -u root -p
```

### 2. Create Database
```sql
CREATE DATABASE enchanted_trading CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE enchanted_trading;
```

### 3. Run Schema File
```sql
SOURCE server/database/schema.sql;
```

## Database Configuration

Update your `.env` file with the correct database credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=enchanted_trading
DB_USER=root
DB_PASSWORD=your_password_here
```

## Default Data

The schema includes:
- Default admin user (username: admin, email: admin@enchantedtrading.com)
- Sample market data for major cryptocurrencies
- Technical indicators for popular trading pairs
- Default user settings and portfolio

### Default Admin Login
- **Username**: admin
- **Email**: admin@enchantedtrading.com
- **Password**: password (change this immediately!)

## Database Features

### Tables Overview

#### Core Tables
- **users**: User accounts and profiles
- **portfolio**: User balance and trading statistics
- **holdings**: Individual asset positions
- **trades**: Trading history and open positions

#### Trading Data
- **signals**: AI-generated trading signals
- **market_data**: Real-time and historical price data
- **technical_indicators**: RSI, MACD, moving averages, etc.

#### User Features
- **price_alerts**: Custom price notifications
- **user_settings**: Personal preferences and API keys
- **notifications**: System and trading notifications
- **backtesting_results**: Strategy testing results

### Indexes and Performance

The database includes optimized indexes for:
- User lookups (email, username)
- Trading queries (user_id, symbol, timestamp)
- Market data retrieval (symbol, timestamp)
- Signal filtering (status, pair, created_at)

### Stored Procedures

- **UpdatePortfolioStats**: Automatically calculates trading statistics
- **UpdateHoldingsPrices**: Updates current market values

### Triggers

- **after_trade_insert**: Updates portfolio stats when trades are created
- **after_trade_update**: Updates stats when trades are modified

### Views

- **user_portfolio_summary**: Combined user and portfolio data
- **active_signals_summary**: Active signals with user information

## Maintenance

### Regular Tasks

1. **Clean Old Data** (automated via scheduler):
```sql
CALL CleanOldMarketData(30); -- Keep 30 days of data
```

2. **Update Statistics**:
```sql
CALL UpdatePortfolioStats(user_id);
```

3. **Backup Database**:
```bash
mysqldump -u root -p enchanted_trading > backup_$(date +%Y%m%d).sql
```

### Performance Monitoring

Monitor these queries for performance:
- Market data retrieval
- User portfolio calculations
- Signal filtering and sorting
- Trade history queries

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check MySQL service is running
   - Verify host and port settings
   - Check firewall settings

2. **Access Denied**
   - Verify username and password
   - Check user privileges
   - Ensure database exists

3. **Character Set Issues**
   - Ensure utf8mb4 charset is used
   - Check collation settings

4. **Performance Issues**
   - Check index usage with EXPLAIN
   - Monitor slow query log
   - Consider partitioning for large tables

### Useful Commands

```sql
-- Check database size
SELECT 
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'enchanted_trading';

-- Check table sizes
SELECT 
    table_name AS 'Table',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES 
WHERE table_schema = 'enchanted_trading'
ORDER BY (data_length + index_length) DESC;

-- Check active connections
SHOW PROCESSLIST;

-- Check slow queries
SHOW VARIABLES LIKE 'slow_query_log';
```

## Security Considerations

1. **Change Default Passwords**: Update the default admin password immediately
2. **Create Limited Users**: Don't use root for application connections
3. **Enable SSL**: Use encrypted connections in production
4. **Regular Backups**: Implement automated backup strategy
5. **Monitor Access**: Log and monitor database access

## Migration Scripts

For future database updates, create migration scripts in the format:
```
YYYYMMDD_description.sql
```

Example: `20241201_add_new_indicators.sql`

This ensures proper versioning and rollback capabilities.