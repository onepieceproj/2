const database = require('../config/database.cjs');

class MarketData {
  static async savePrice(symbol, priceData) {
    const {
      price,
      volume = 0,
      high24h = 0,
      low24h = 0,
      change24h = 0,
      changePercentage24h = 0,
      marketCap = 0
    } = priceData;

    const sql = `
      INSERT INTO market_data (
        symbol, price, volume, high_24h, low_24h, 
        change_24h, change_percentage_24h, market_cap
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      symbol, price, volume, high24h, low24h,
      change24h, changePercentage24h, marketCap
    ];

    const result = await database.query(sql, params);
    return result.insertId;
  }

  static async getLatestPrice(symbol) {
    const sql = `
      SELECT * FROM market_data 
      WHERE symbol = ? 
      ORDER BY timestamp DESC 
      LIMIT 1
    `;
    
    const result = await database.query(sql, [symbol]);
    return result.length > 0 ? result[0] : null;
  }

  static async getLatestPrices(symbols = []) {
    let sql = `
      SELECT DISTINCT symbol, price, volume, high_24h, low_24h, 
             change_24h, change_percentage_24h, market_cap, timestamp
      FROM market_data m1
      WHERE timestamp = (
        SELECT MAX(timestamp) 
        FROM market_data m2 
        WHERE m2.symbol = m1.symbol
      )
    `;
    
    const params = [];
    
    if (symbols.length > 0) {
      sql += ` AND symbol IN (${symbols.map(() => '?').join(',')})`;
      params.push(...symbols);
    }
    
    sql += ' ORDER BY symbol';
    
    return await database.query(sql, params);
  }

  static async getPriceHistory(symbol, hours = 24) {
    const sql = `
      SELECT * FROM market_data 
      WHERE symbol = ? 
        AND timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
      ORDER BY timestamp ASC
    `;
    
    return await database.query(sql, [symbol, hours]);
  }

  static async saveTechnicalIndicators(symbol, timeframe, indicators) {
    const {
      rsi, macd, macdSignal, macdHistogram,
      sma20, sma50, sma200, ema12, ema26,
      bollingerUpper, bollingerMiddle, bollingerLower,
      volumeSma, atr, stochasticK, stochasticD, williamsR
    } = indicators;

    const sql = `
      INSERT INTO technical_indicators (
        symbol, timeframe, rsi, macd, macd_signal, macd_histogram,
        sma_20, sma_50, sma_200, ema_12, ema_26,
        bollinger_upper, bollinger_middle, bollinger_lower,
        volume_sma, atr, stochastic_k, stochastic_d, williams_r
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        rsi = VALUES(rsi), macd = VALUES(macd), macd_signal = VALUES(macd_signal),
        macd_histogram = VALUES(macd_histogram), sma_20 = VALUES(sma_20),
        sma_50 = VALUES(sma_50), sma_200 = VALUES(sma_200),
        ema_12 = VALUES(ema_12), ema_26 = VALUES(ema_26),
        bollinger_upper = VALUES(bollinger_upper), bollinger_middle = VALUES(bollinger_middle),
        bollinger_lower = VALUES(bollinger_lower), volume_sma = VALUES(volume_sma),
        atr = VALUES(atr), stochastic_k = VALUES(stochastic_k),
        stochastic_d = VALUES(stochastic_d), williams_r = VALUES(williams_r),
        timestamp = NOW()
    `;

    const params = [
      symbol, timeframe, rsi, macd, macdSignal, macdHistogram,
      sma20, sma50, sma200, ema12, ema26,
      bollingerUpper, bollingerMiddle, bollingerLower,
      volumeSma, atr, stochasticK, stochasticD, williamsR
    ];

    await database.query(sql, params);
  }

  static async getTechnicalIndicators(symbol, timeframe) {
    const sql = `
      SELECT * FROM technical_indicators 
      WHERE symbol = ? AND timeframe = ?
      ORDER BY timestamp DESC 
      LIMIT 1
    `;
    
    const result = await database.query(sql, [symbol, timeframe]);
    return result.length > 0 ? result[0] : null;
  }

  static async getMarketOverview() {
    const sql = `
      SELECT 
        symbol,
        price,
        change_percentage_24h,
        volume,
        market_cap,
        timestamp
      FROM market_data m1
      WHERE timestamp = (
        SELECT MAX(timestamp) 
        FROM market_data m2 
        WHERE m2.symbol = m1.symbol
      )
      ORDER BY market_cap DESC
      LIMIT 20
    `;
    
    return await database.query(sql);
  }

  static async getTopMovers(limit = 10) {
    const sql = `
      SELECT 
        symbol,
        price,
        change_percentage_24h,
        volume,
        timestamp
      FROM market_data m1
      WHERE timestamp = (
        SELECT MAX(timestamp) 
        FROM market_data m2 
        WHERE m2.symbol = m1.symbol
      )
      ORDER BY ABS(change_percentage_24h) DESC
      LIMIT ?
    `;
    
    return await database.query(sql, [limit]);
  }

  static async cleanOldData(daysToKeep = 30) {
    const sql = `
      DELETE FROM market_data 
      WHERE timestamp < DATE_SUB(NOW(), INTERVAL ? DAY)
    `;
    
    const result = await database.query(sql, [daysToKeep]);
    
    const indicatorsSql = `
      DELETE FROM technical_indicators 
      WHERE timestamp < DATE_SUB(NOW(), INTERVAL ? DAY)
    `;
    
    const indicatorsResult = await database.query(indicatorsSql, [daysToKeep]);
    
    return {
      marketDataDeleted: result.affectedRows,
      indicatorsDeleted: indicatorsResult.affectedRows
    };
  }

}

module.exports = MarketData;