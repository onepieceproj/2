# Enchanted Trading Platform

A professional cryptocurrency trading platform with AI-powered signal generation, real-time market analysis, and comprehensive portfolio management.

## Features

- **Real-time Market Data**: Live cryptocurrency prices and market analysis
- **AI Signal Generation**: Advanced technical analysis with RSI, MACD, and moving averages
- **Portfolio Management**: Track holdings, P&L, and trading performance
- **Spot & Margin Trading**: Support for both spot and leveraged trading
- **Risk Management**: Position sizing calculators and risk monitoring
- **Price Alerts**: Custom notifications for price movements and technical indicators
- **Backtesting**: Test trading strategies with historical data
- **Live Trading**: Automated trading with configurable parameters

## Prerequisites

- Node.js 18+ and npm
- MySQL 8.0+
- Binance account with API access (optional for demo mode)

## Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Database Setup:**
```bash
# Create MySQL database
mysql -u root -p -e "CREATE DATABASE enchanted_trading CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

3. **Environment Configuration:**
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration:
# - Database credentials
# - JWT secret key
# - Binance API keys (optional)
```

4. **Start the application:**
```bash
# Start backend server
npm run server

# In another terminal, start frontend
npm run dev
```

## Configuration

### Database Setup
The application will automatically create the required database schema on first run. Ensure your MySQL credentials are correct in the `.env` file.

### Binance API Setup
1. Create a Binance account at [binance.com](https://binance.com)
2. Generate API keys in your account settings
3. Configure API keys in the application Settings page
4. For testing, enable "Testnet Mode" in settings

### Security Recommendations
- Use read-only API keys initially
- Enable IP restrictions on your Binance API keys
- Use strong passwords and enable 2FA
- Keep your API keys secure and never share them

## Usage

### Getting Started
1. Register a new account or login
2. Configure your Binance API keys in Settings
3. Navigate to the Dashboard to view market data
4. Generate trading signals using the AI Signal Generator
5. Execute trades through the Spot Trading interface

### Trading Workflow
1. **Market Analysis**: Review market conditions and technical indicators
2. **Signal Generation**: Use AI to generate trading signals based on technical analysis
3. **Risk Assessment**: Use the Risk Management tools to calculate position sizes
4. **Trade Execution**: Execute trades through Spot or Margin trading interfaces
5. **Portfolio Monitoring**: Track performance and manage positions

### Key Features

#### AI Signal Generator
- Analyzes multiple technical indicators (RSI, MACD, Moving Averages)
- Provides confidence scores and risk-reward ratios
- Supports multiple timeframes (5m, 15m, 1h, 4h, 1d)
- Generates stop-loss and take-profit levels

#### Risk Management
- Position sizing calculator
- Portfolio risk monitoring
- Drawdown analysis
- Risk-reward ratio optimization

#### Live Trading
- Real-time signal execution
- Automated trading with configurable parameters
- Risk monitoring and position management
- Execution logging and performance tracking

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Trading Signals
- `GET /api/signals` - Get user signals
- `GET /api/signals/active` - Get active signals
- `POST /api/ai/generate-signal` - Generate AI signal
- `PUT /api/signals/:id/status` - Update signal status

### Portfolio Management
- `GET /api/portfolio` - Get portfolio data
- `GET /api/portfolio/holdings` - Get holdings
- `PUT /api/portfolio/balance` - Update balance
- `GET /api/portfolio/performance` - Get performance metrics

### Trading Operations
- `GET /api/trades` - Get trade history
- `POST /api/trades` - Create new trade
- `PUT /api/trades/:id/close` - Close trade
- `GET /api/trades/open` - Get open positions

### Market Data
- `GET /api/market/prices` - Get latest prices
- `GET /api/market/history/:symbol` - Get price history
- `GET /api/market/overview` - Get market overview

## Development

### Project Structure
```
src/
├── components/          # Reusable UI components
├── pages/              # Application pages
├── context/            # React context providers
├── hooks/              # Custom React hooks
├── services/           # API and external services
└── assets/             # Static assets

server/
├── config/             # Database and server configuration
├── models/             # Database models
├── routes/             # API route handlers
├── services/           # Backend services
└── middleware/         # Express middleware
```

### Adding New Features
1. Create database models in `server/models/`
2. Add API routes in `server/routes/`
3. Create frontend services in `src/services/`
4. Build UI components in `src/components/`
5. Add pages in `src/pages/`

## Production Deployment

### Database
- Use a production MySQL instance
- Enable SSL connections
- Set up regular backups
- Monitor performance and optimize queries

### Security
- Use environment variables for all secrets
- Enable HTTPS
- Implement proper CORS policies
- Use rate limiting and request validation
- Regular security audits

### Monitoring
- Set up application logging
- Monitor API response times
- Track database performance
- Set up alerts for system health

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MySQL service is running
   - Verify credentials in `.env` file
   - Ensure database exists and user has permissions

2. **Binance API Errors**
   - Verify API keys are correct
   - Check API key permissions
   - Ensure IP restrictions allow your server

3. **Rate Limiting**
   - Reduce request frequency
   - Implement proper caching
   - Use WebSocket connections for real-time data

### Support
For technical support or questions:
- Check the Help section in the application
- Review API documentation
- Contact support team

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Disclaimer

This software is for educational and informational purposes only. Cryptocurrency trading involves substantial risk of loss. Always do your own research and never invest more than you can afford to lose.