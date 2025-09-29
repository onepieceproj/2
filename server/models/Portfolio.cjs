const database = require('../config/database.cjs');

class Portfolio {
  static async findByUser(userId) {
    const sql = `
      SELECT * FROM portfolio 
      WHERE user_id = ?
    `;
    
    const portfolios = await database.query(sql, [userId]);
    return portfolios.length > 0 ? portfolios[0] : null;
  }

  static async updateBalance(userId, totalBalance, availableBalance, lockedBalance = 0) {
    const sql = `
      UPDATE portfolio 
      SET total_balance = ?, available_balance = ?, locked_balance = ?, updated_at = NOW()
      WHERE user_id = ?
    `;
    
    await database.query(sql, [totalBalance, availableBalance, lockedBalance, userId]);
  }

  static async updatePnL(userId, totalPnl, dailyPnl = 0) {
    const sql = `
      UPDATE portfolio 
      SET total_pnl = ?, daily_pnl = ?, updated_at = NOW()
      WHERE user_id = ?
    `;
    
    await database.query(sql, [totalPnl, dailyPnl, userId]);
  }

  static async getHoldings(userId) {
    const sql = `
      SELECT h.*, m.price as current_market_price
      FROM holdings h
      LEFT JOIN market_data m ON h.symbol = m.symbol
      WHERE h.user_id = ? AND h.quantity > 0
      ORDER BY h.market_value DESC
    `;
    
    return await database.query(sql, [userId]);
  }

  static async updateHolding(userId, symbol, quantity, avgPrice, assetName = null) {
    // Check if holding exists
    const existingHolding = await database.query(
      'SELECT * FROM holdings WHERE user_id = ? AND symbol = ?',
      [userId, symbol]
    );

    if (existingHolding.length > 0) {
      // Update existing holding
      const current = existingHolding[0];
      const totalQuantity = parseFloat(current.quantity) + parseFloat(quantity);
      const newAvgPrice = totalQuantity > 0 
        ? ((current.quantity * current.avg_price) + (quantity * avgPrice)) / totalQuantity
        : avgPrice;

      const sql = `
        UPDATE holdings 
        SET quantity = ?, avg_price = ?, asset_name = COALESCE(?, asset_name), last_updated = NOW()
        WHERE user_id = ? AND symbol = ?
      `;
      
      await database.query(sql, [totalQuantity, newAvgPrice, assetName, userId, symbol]);
    } else {
      // Create new holding
      const sql = `
        INSERT INTO holdings (user_id, symbol, asset_name, quantity, avg_price)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      await database.query(sql, [userId, symbol, assetName, quantity, avgPrice]);
    }
  }

  static async removeHolding(userId, symbol) {
    const sql = 'DELETE FROM holdings WHERE user_id = ? AND symbol = ?';
    await database.query(sql, [userId, symbol]);
  }

  static async calculatePortfolioValue(userId) {
    const sql = `
      SELECT 
        SUM(h.market_value) as total_holdings_value,
        SUM(h.unrealized_pnl) as total_unrealized_pnl,
        COUNT(h.id) as total_holdings
      FROM holdings h
      WHERE h.user_id = ? AND h.quantity > 0
    `;
    
    const result = await database.query(sql, [userId]);
    return result[0] || {
      total_holdings_value: 0,
      total_unrealized_pnl: 0,
      total_holdings: 0
    };
  }

  static async getPerformanceMetrics(userId, days = 30) {
    const sql = `
      SELECT 
        COUNT(*) as total_trades,
        SUM(CASE WHEN realized_pnl > 0 THEN 1 ELSE 0 END) as winning_trades,
        SUM(CASE WHEN realized_pnl < 0 THEN 1 ELSE 0 END) as losing_trades,
        AVG(CASE WHEN realized_pnl > 0 THEN realized_pnl END) as avg_win,
        AVG(CASE WHEN realized_pnl < 0 THEN realized_pnl END) as avg_loss,
        MAX(realized_pnl) as best_trade,
        MIN(realized_pnl) as worst_trade,
        SUM(realized_pnl) as total_realized_pnl,
        AVG(duration_minutes) as avg_trade_duration
      FROM trades 
      WHERE user_id = ? 
        AND status = 'CLOSED' 
        AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    `;
    
    const result = await database.query(sql, [userId, days]);
    const metrics = result[0];
    
    // Calculate additional metrics
    if (metrics.total_trades > 0) {
      metrics.win_rate = (metrics.winning_trades / metrics.total_trades) * 100;
      metrics.profit_factor = metrics.avg_win && metrics.avg_loss 
        ? Math.abs(metrics.avg_win / metrics.avg_loss) 
        : 0;
    } else {
      metrics.win_rate = 0;
      metrics.profit_factor = 0;
    }
    
    return metrics;
  }

  static async getDiversification(userId) {
    const sql = `
      SELECT 
        symbol,
        asset_name,
        market_value,
        (market_value / (SELECT SUM(market_value) FROM holdings WHERE user_id = ? AND quantity > 0)) * 100 as percentage
      FROM holdings 
      WHERE user_id = ? AND quantity > 0
      ORDER BY market_value DESC
    `;
    
    return await database.query(sql, [userId, userId]);
  }

  static async getRecentActivity(userId, limit = 10) {
    const sql = `
      SELECT 
        'TRADE' as type,
        pair as symbol,
        side as action,
        quantity,
        entry_price as price,
        realized_pnl as pnl,
        created_at as timestamp
      FROM trades 
      WHERE user_id = ?
      
      UNION ALL
      
      SELECT 
        'SIGNAL' as type,
        pair as symbol,
        type as action,
        NULL as quantity,
        price,
        NULL as pnl,
        created_at as timestamp
      FROM signals 
      WHERE user_id = ?
      
      ORDER BY timestamp DESC
      LIMIT ?
    `;
    
    return await database.query(sql, [userId, userId, limit]);
  }
}

module.exports = Portfolio;