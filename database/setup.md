# Enchanted Trading Database Setup Guide

This guide will help you set up the MySQL database for the Enchanted Trading platform.

## Prerequisites

- MySQL 8.0 or higher
- MySQL client or MySQL Workbench
- Administrative access to MySQL server

## Quick Setup

### 1. Start MySQL Server
Make sure your MySQL server is running on localhost:3306

### 2. Create Database and Import Schema
```bash
# Navigate to the project directory
cd your-project-directory

# Import the schema (this will create the database and all tables)
mysql -u root -p < database/schema.sql
```

### 3. Update Environment Variables
Copy the `.env` file and update your database credentials:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=enchanted_trading
DB_USER=root
DB_PASSWORD=your_mysql_password_here
```

### 4. Start the Backend Server
```bash
npm run server
```

## Manual Setup (Alternative)

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
SOURCE /path/to/your/project/database/schema.sql;
```

## Database Features

### Tables Overview

#### Core Tables
- **users**: User accounts and authentication
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

### Default Data

The schema includes:
- Default admin user (username: admin, email: admin@enchantedtrading.com, password: password)
- Sample market data for major cryptocurrencies
- Technical indicators for popular trading pairs
- Default user settings and portfolio

### API Endpoints

Once the backend is running, you can access:

- **Authentication**: `POST /api/auth/login`, `POST /api/auth/register`
- **AI Signals**: `POST /api/ai/generate-signal`, `GET /api/ai/recent-signals`
- **Market Data**: `GET /api/market/prices`, `GET /api/market/history/:symbol`
- **Portfolio**: `GET /api/portfolio`, `GET /api/portfolio/holdings`
- **Trades**: `GET /api/trades`, `POST /api/trades`

### WebSocket Connection

Real-time data is available via WebSocket at: `ws://localhost:5000/ws`

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check MySQL service is running: `sudo service mysql start`
   - Verify host and port settings in `.env`
   - Check firewall settings

2. **Access Denied**
   - Verify username and password in `.env`
   - Check user privileges: `GRANT ALL PRIVILEGES ON enchanted_trading.* TO 'root'@'localhost';`

3. **Schema Import Errors**
   - Ensure MySQL version is 8.0+
   - Check file permissions on schema.sql
   - Verify charset support: `SHOW VARIABLES LIKE 'character_set%';`

### Useful Commands

```sql
-- Check database size
SELECT 
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'enchanted_trading';

-- Check table status
SHOW TABLE STATUS FROM enchanted_trading;

-- View recent signals
SELECT * FROM signals ORDER BY created_at DESC LIMIT 10;

-- Check user portfolio
SELECT u.username, p.* FROM users u 
JOIN portfolio p ON u.id = p.user_id;
```

## Security Considerations

1. **Change Default Passwords**: Update the default admin password immediately
2. **Create Limited Users**: Don't use root for application connections
3. **Enable SSL**: Use encrypted connections in production
4. **Regular Backups**: Implement automated backup strategy
5. **Monitor Access**: Log and monitor database access

## Performance Optimization

1. **Indexes**: The schema includes optimized indexes for common queries
2. **Connection Pooling**: The backend uses connection pooling for better performance
3. **Query Optimization**: Use EXPLAIN to analyze slow queries
4. **Regular Maintenance**: Run OPTIMIZE TABLE periodically

## Backup and Recovery

```bash
# Create backup
mysqldump -u root -p enchanted_trading > backup_$(date +%Y%m%d).sql

# Restore from backup
mysql -u root -p enchanted_trading < backup_20241201.sql
```

## Next Steps

1. Start the backend server: `npm run server`
2. Test the API endpoints using Postman or curl
3. Connect the frontend to the backend
4. Configure Binance API keys for real market data
5. Set up WebSocket connections for real-time updates

The backend will automatically create the database schema on first run if it doesn't exist.