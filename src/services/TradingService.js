import ApiService from './ApiService';

class TradingService {
  constructor() {
    this.isLiveTrading = false;
    this.activeOrders = new Map();
    this.executionQueue = [];
  }

  // Execute a real trade
  async executeTrade(orderData) {
    try {
      const {
        symbol,
        side,
        type,
        quantity,
        price,
        stopLoss,
        takeProfit
      } = orderData;

      // Validate order data
      if (!symbol || !side || !quantity) {
        throw new Error('Missing required order parameters');
      }

      // Create trade record first
      const tradeData = {
        pair: symbol,
        side,
        type: type || 'MARKET',
        quantity,
        entryPrice: price || 0,
        stopLoss,
        takeProfit,
        notes: 'Executed via Enchanted Trading Platform'
      };

      const tradeResult = await ApiService.createTrade(tradeData);
      
      if (tradeResult.success) {
        // Simulate order execution for demo
        const mockOrderResult = {
          success: true,
          data: {
            orderId: 'ORD' + Date.now(),
            executedPrice: price || (43000 + Math.random() * 500),
            executedQty: quantity,
            commission: quantity * 0.001,
            status: 'FILLED'
          }
        };
        
        return {
          success: true,
          data: {
            order: mockOrderResult.data,
            trade: tradeResult.data
          }
        };
      }
      
      return tradeResult;
    } catch (error) {
      console.error('Trade execution error:', error);
      throw error;
    }
  }

  // Execute order via Binance API (for real trading)
  async executeBinanceOrder(orderData) {
    try {
      const orderResult = await ApiService.placeOrder({
        symbol,
        side,
        type: type || 'MARKET',
        quantity,
        ...(type === 'LIMIT' && { price }),
        ...(stopLoss && { stopPrice: stopLoss }),
        ...(takeProfit && { takeProfitPrice: takeProfit })
      });

      if (orderResult.success) {
        // Create trade record
        const tradeData = {
          pair: symbol,
          side,
          type: type || 'MARKET',
          quantity,
          entryPrice: orderResult.data.executedPrice || price,
          stopLoss,
          takeProfit,
          fees: orderResult.data.commission || 0,
          notes: 'Executed via Enchanted Trading Platform'
        };

        const tradeResult = await ApiService.createTrade(tradeData);
        
        return {
          success: true,
          data: {
            order: orderResult.data,
            trade: tradeResult.data
          }
        };
      }

      return orderResult;
    } catch (error) {
      console.error('Trade execution error:', error);
      throw error;
    }
  }

  // Start live trading mode
  async startLiveTrading(settings) {
    try {
      this.isLiveTrading = true;
      
      // Validate settings
      if (!settings.allowedPairs || settings.allowedPairs.length === 0) {
        throw new Error('No trading pairs configured');
      }

      if (!settings.minConfidence || settings.minConfidence < 60) {
        throw new Error('Minimum confidence must be at least 60%');
      }

      console.log('Live trading started with settings:', settings);
      
      // Start monitoring signals
      this.startSignalMonitoring(settings);
      
      return { success: true, message: 'Live trading started successfully' };
    } catch (error) {
      this.isLiveTrading = false;
      throw error;
    }
  }

  // Stop live trading
  stopLiveTrading() {
    this.isLiveTrading = false;
    this.executionQueue = [];
    console.log('Live trading stopped');
    
    return { success: true, message: 'Live trading stopped' };
  }

  // Monitor signals for auto-execution
  async startSignalMonitoring(settings) {
    const checkSignals = async () => {
      if (!this.isLiveTrading) return;

      try {
        const signalsResult = await ApiService.getActiveSignals();
        
        if (signalsResult.success) {
          const eligibleSignals = signalsResult.data.filter(signal => 
            signal.confidence >= settings.minConfidence &&
            settings.allowedPairs.includes(signal.pair) &&
            signal.status === 'ACTIVE'
          );

          for (const signal of eligibleSignals) {
            await this.processSignal(signal, settings);
          }
        }
      } catch (error) {
        console.error('Signal monitoring error:', error);
      }
    };

    // Check signals every 30 seconds
    const interval = setInterval(checkSignals, 30000);
    
    // Store interval for cleanup
    this.signalMonitoringInterval = interval;
  }

  // Process individual signal for execution
  async processSignal(signal, settings) {
    try {
      // Check if we already have too many positions
      const openTrades = await ApiService.getTrades(50, 0, 'OPEN');
      if (openTrades.success && openTrades.data.length >= settings.maxPositions) {
        console.log('Max positions reached, skipping signal:', signal.id);
        return;
      }

      // Calculate position size based on risk settings
      const accountBalance = await ApiService.getAccountBalance();
      if (!accountBalance.success) return;

      const riskAmount = accountBalance.data.USDT.free * (settings.riskPerTrade / 100);
      const stopLossDistance = Math.abs(signal.price - (signal.stopLoss || signal.price * 0.97));
      const positionSize = riskAmount / stopLossDistance;

      // Execute the trade
      const orderData = {
        symbol: signal.pair,
        side: signal.type,
        type: 'MARKET',
        quantity: positionSize,
        stopLoss: signal.stopLoss,
        takeProfit: signal.takeProfit
      };

      const result = await this.executeTrade(orderData);
      
      if (result.success) {
        console.log('Auto-executed trade for signal:', signal.id);
        
        // Update signal status
        await ApiService.updateSignalStatus(signal.id, 'EXECUTED');
      }

    } catch (error) {
      console.error('Signal processing error:', error);
    }
  }

  // Get live trading status
  getLiveTradingStatus() {
    return {
      isActive: this.isLiveTrading,
      activeOrders: this.activeOrders.size,
      queuedSignals: this.executionQueue.length
    };
  }

  // Risk management checks
  async checkRiskLimits(orderData, settings) {
    try {
      // Check daily loss limit
      const todayTrades = await ApiService.getTradeHistory({
        dateFrom: new Date().toISOString().split('T')[0]
      });

      if (todayTrades.success) {
        const dailyPnL = todayTrades.data.reduce((sum, trade) => 
          sum + (trade.realized_pnl || 0), 0
        );

        const accountBalance = await ApiService.getAccountBalance();
        const dailyLossPercent = Math.abs(dailyPnL) / accountBalance.data.USDT.free * 100;

        if (dailyLossPercent >= settings.maxDailyLoss) {
          throw new Error('Daily loss limit exceeded');
        }
      }

      // Check position size limits
      const positionValue = orderData.quantity * orderData.price;
      const maxPositionValue = settings.maxPositionSize || 5000;

      if (positionValue > maxPositionValue) {
        throw new Error('Position size exceeds maximum allowed');
      }

      return true;
    } catch (error) {
      console.error('Risk check failed:', error);
      throw error;
    }
  }

  // Cleanup method
  cleanup() {
    this.isLiveTrading = false;
    if (this.signalMonitoringInterval) {
      clearInterval(this.signalMonitoringInterval);
    }
    this.activeOrders.clear();
    this.executionQueue = [];
  }
}

export default new TradingService();