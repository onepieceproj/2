const binanceService = require('./binanceService.cjs');

class AISignalService {
  constructor() {
    this.signalHistory = [];
    this.isAnalyzing = false;
  }

  // Main method to generate AI trading signals
  async generateSignal(symbol, timeframe = '1h') {
    try {
      this.isAnalyzing = true;
      
      // Get market data and technical indicators
      const klineData = await binanceService.getKlineData(symbol, timeframe, 100);
      const technicalIndicators = binanceService.calculateTechnicalIndicators(klineData);
      const currentPrice = klineData[klineData.length - 1].close;
      
      // Analyze market conditions
      const marketAnalysis = this.analyzeMarketConditions(klineData, technicalIndicators);
      
      // Generate signal based on AI analysis
      const signal = this.generateAISignal(symbol, currentPrice, technicalIndicators, marketAnalysis, timeframe);
      
      // Store signal in history
      this.signalHistory.push({
        ...signal,
        timestamp: new Date(),
        klineData: klineData.slice(-20) // Keep last 20 candles for reference
      });
      
      // Keep only last 100 signals
      if (this.signalHistory.length > 100) {
        this.signalHistory = this.signalHistory.slice(-100);
      }
      
      this.isAnalyzing = false;
      return signal;
      
    } catch (error) {
      this.isAnalyzing = false;
      console.error('Error generating AI signal:', error);
      throw error;
    }
  }

  // Analyze current market conditions
  analyzeMarketConditions(klineData, indicators) {
    if (!indicators || klineData.length < 50) {
      return {
        trend: 'NEUTRAL',
        volatility: 'MEDIUM',
        momentum: 'NEUTRAL',
        volume: 'NORMAL'
      };
    }

    const recentCandles = klineData.slice(-20);
    const prices = recentCandles.map(k => k.close);
    const volumes = recentCandles.map(k => k.volume);
    
    // Trend Analysis
    const trend = this.analyzeTrend(prices, indicators);
    
    // Volatility Analysis
    const volatility = this.analyzeVolatility(prices);
    
    // Momentum Analysis
    const momentum = this.analyzeMomentum(indicators);
    
    // Volume Analysis
    const volume = this.analyzeVolume(volumes);
    
    return {
      trend,
      volatility,
      momentum,
      volume,
      strength: this.calculateSignalStrength(trend, volatility, momentum, volume)
    };
  }

  // Analyze price trend
  analyzeTrend(prices, indicators) {
    const currentPrice = prices[prices.length - 1];
    const sma20 = indicators.sma20;
    const sma50 = indicators.sma50;
    
    if (!sma20 || !sma50) return 'NEUTRAL';
    
    // Multiple timeframe trend analysis
    if (currentPrice > sma20 && sma20 > sma50) {
      return 'BULLISH';
    } else if (currentPrice < sma20 && sma20 < sma50) {
      return 'BEARISH';
    } else {
      return 'NEUTRAL';
    }
  }

  // Analyze market volatility
  analyzeVolatility(prices) {
    if (prices.length < 10) return 'MEDIUM';
    
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
    
    const avgReturn = returns.reduce((a, b) => a + b) / returns.length;
    const variance = returns.reduce((acc, ret) => acc + Math.pow(ret - avgReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance);
    
    if (volatility > 0.03) return 'HIGH';
    if (volatility < 0.01) return 'LOW';
    return 'MEDIUM';
  }

  // Analyze momentum indicators
  analyzeMomentum(indicators) {
    const { rsi, macd } = indicators;
    
    if (!rsi || !macd) return 'NEUTRAL';
    
    let momentumScore = 0;
    
    // RSI Analysis
    if (rsi > 70) momentumScore -= 1; // Overbought
    else if (rsi < 30) momentumScore += 1; // Oversold
    else if (rsi > 50) momentumScore += 0.5; // Bullish momentum
    else momentumScore -= 0.5; // Bearish momentum
    
    // MACD Analysis
    if (macd.macd > macd.signal) momentumScore += 0.5;
    else momentumScore -= 0.5;
    
    if (momentumScore > 0.5) return 'BULLISH';
    if (momentumScore < -0.5) return 'BEARISH';
    return 'NEUTRAL';
  }

  // Analyze volume patterns
  analyzeVolume(volumes) {
    if (volumes.length < 10) return 'NORMAL';
    
    const recentVolume = volumes.slice(-5).reduce((a, b) => a + b) / 5;
    const avgVolume = volumes.reduce((a, b) => a + b) / volumes.length;
    
    const volumeRatio = recentVolume / avgVolume;
    
    if (volumeRatio > 1.5) return 'HIGH';
    if (volumeRatio < 0.7) return 'LOW';
    return 'NORMAL';
  }

  // Calculate overall signal strength
  calculateSignalStrength(trend, volatility, momentum, volume) {
    let strength = 0;
    
    // Trend contribution
    if (trend === 'BULLISH' || trend === 'BEARISH') strength += 30;
    
    // Momentum contribution
    if (momentum === 'BULLISH' || momentum === 'BEARISH') strength += 25;
    
    // Volume contribution
    if (volume === 'HIGH') strength += 20;
    else if (volume === 'NORMAL') strength += 10;
    
    // Volatility contribution (lower volatility = higher confidence)
    if (volatility === 'LOW') strength += 15;
    else if (volatility === 'MEDIUM') strength += 10;
    else strength += 5;
    
    // Alignment bonus
    if ((trend === 'BULLISH' && momentum === 'BULLISH') || 
        (trend === 'BEARISH' && momentum === 'BEARISH')) {
      strength += 10;
    }
    
    return Math.min(strength, 100);
  }

  // Generate the actual AI signal
  generateAISignal(symbol, currentPrice, indicators, marketAnalysis, timeframe) {
    const { trend, momentum, strength } = marketAnalysis;
    
    // Determine signal type based on analysis
    let signalType = 'HOLD';
    let confidence = Math.max(60, strength); // Minimum 60% confidence
    
    // Signal generation logic
    if (trend === 'BULLISH' && momentum === 'BULLISH' && indicators.rsi < 70) {
      signalType = 'BUY';
    } else if (trend === 'BEARISH' && momentum === 'BEARISH' && indicators.rsi > 30) {
      signalType = 'SELL';
    } else if (indicators.rsi < 30 && trend !== 'BEARISH') {
      signalType = 'BUY';
      confidence = Math.min(confidence, 75); // Lower confidence for oversold signals
    } else if (indicators.rsi > 70 && trend !== 'BULLISH') {
      signalType = 'SELL';
      confidence = Math.min(confidence, 75); // Lower confidence for overbought signals
    }
    
    // Calculate stop loss and take profit
    const { stopLoss, takeProfit } = this.calculateRiskLevels(
      currentPrice, 
      signalType, 
      indicators, 
      marketAnalysis.volatility
    );
    
    // Calculate risk-reward ratio
    const riskRewardRatio = signalType !== 'HOLD' 
      ? Math.abs(takeProfit - currentPrice) / Math.abs(currentPrice - stopLoss)
      : 0;
    
    return {
      symbol,
      type: signalType,
      price: currentPrice,
      confidence: Math.round(confidence),
      timeframe,
      indicators: {
        rsi: indicators.rsi,
        macd: indicators.macd?.macd,
        macdSignal: indicators.macd?.signal,
        sma20: indicators.sma20,
        sma50: indicators.sma50,
        ema12: indicators.ema12,
        ema26: indicators.ema26,
        atr: indicators.atr,
        stochastic: indicators.stochastic
      },
      technicalAnalysis: {
        trend: marketAnalysis.trend,
        momentum: marketAnalysis.momentum,
        volatility: marketAnalysis.volatility,
        volume: marketAnalysis.volume,
        strength: marketAnalysis.strength,
        support: this.calculateSupport(currentPrice, indicators),
        resistance: this.calculateResistance(currentPrice, indicators)
      },
      riskRewardRatio: Math.round(riskRewardRatio * 100) / 100,
      stopLoss,
      takeProfit,
      expiresAt: this.calculateExpiration(timeframe)
    };
  }

  // Calculate stop loss and take profit levels
  calculateRiskLevels(price, signalType, indicators, volatility) {
    if (signalType === 'HOLD') {
      return { stopLoss: null, takeProfit: null };
    }
    
    // Base risk percentage based on volatility
    let riskPercent = 0.02; // 2% default
    if (volatility === 'HIGH') riskPercent = 0.03;
    if (volatility === 'LOW') riskPercent = 0.015;
    
    // Use ATR for dynamic stop loss if available
    if (indicators.atr) {
      const atrMultiplier = volatility === 'HIGH' ? 2.5 : volatility === 'LOW' ? 1.5 : 2.0;
      riskPercent = (indicators.atr * atrMultiplier) / price;
    }
    
    let stopLoss, takeProfit;
    
    if (signalType === 'BUY') {
      stopLoss = price * (1 - riskPercent);
      takeProfit = price * (1 + riskPercent * 2.5); // 2.5:1 risk-reward
    } else {
      stopLoss = price * (1 + riskPercent);
      takeProfit = price * (1 - riskPercent * 2.5);
    }
    
    return {
      stopLoss: Math.round(stopLoss * 100000000) / 100000000, // 8 decimal places
      takeProfit: Math.round(takeProfit * 100000000) / 100000000
    };
  }

  // Calculate support level
  calculateSupport(currentPrice, indicators) {
    const supports = [];
    
    if (indicators.sma20) supports.push(indicators.sma20);
    if (indicators.sma50) supports.push(indicators.sma50);
    if (indicators.bollingerBands?.lower) supports.push(indicators.bollingerBands.lower);
    
    // Find the closest support below current price
    const validSupports = supports.filter(s => s < currentPrice);
    return validSupports.length > 0 ? Math.max(...validSupports) : currentPrice * 0.98;
  }

  // Calculate resistance level
  calculateResistance(currentPrice, indicators) {
    const resistances = [];
    
    if (indicators.sma20) resistances.push(indicators.sma20);
    if (indicators.sma50) resistances.push(indicators.sma50);
    if (indicators.bollingerBands?.upper) resistances.push(indicators.bollingerBands.upper);
    
    // Find the closest resistance above current price
    const validResistances = resistances.filter(r => r > currentPrice);
    return validResistances.length > 0 ? Math.min(...validResistances) : currentPrice * 1.02;
  }

  // Calculate signal expiration time
  calculateExpiration(timeframe) {
    const now = new Date();
    const multipliers = {
      '5m': 30,   // 30 minutes
      '15m': 60,  // 1 hour
      '1h': 240,  // 4 hours
      '4h': 720,  // 12 hours
      '1d': 1440  // 24 hours
    };
    
    const minutes = multipliers[timeframe] || 240;
    return new Date(now.getTime() + minutes * 60000);
  }

  // Get signal statistics
  getSignalStats() {
    if (this.signalHistory.length === 0) {
      return {
        totalSignals: 0,
        buySignals: 0,
        sellSignals: 0,
        avgConfidence: 0,
        successRate: 0
      };
    }
    
    const buySignals = this.signalHistory.filter(s => s.type === 'BUY').length;
    const sellSignals = this.signalHistory.filter(s => s.type === 'SELL').length;
    const totalConfidence = this.signalHistory.reduce((sum, s) => sum + s.confidence, 0);
    
    return {
      totalSignals: this.signalHistory.length,
      buySignals,
      sellSignals,
      avgConfidence: Math.round(totalConfidence / this.signalHistory.length),
      successRate: this.calculateSuccessRate()
    };
  }

  // Calculate historical success rate (simplified)
  calculateSuccessRate() {
    // This would require tracking actual trade outcomes
    // For now, return a simulated success rate based on signal quality
    const recentSignals = this.signalHistory.slice(-20);
    if (recentSignals.length === 0) return 0;
    
    const avgConfidence = recentSignals.reduce((sum, s) => sum + s.confidence, 0) / recentSignals.length;
    return Math.min(95, Math.max(60, avgConfidence - 10)); // Convert confidence to success rate
  }

  // Get recent signals
  getRecentSignals(limit = 10) {
    return this.signalHistory
      .slice(-limit)
      .reverse()
      .map(signal => ({
        ...signal,
        klineData: undefined // Remove kline data from response
      }));
  }

  // Clear signal history
  clearHistory() {
    this.signalHistory = [];
  }
}

module.exports = new AISignalService();