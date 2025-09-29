const database = require('../config/database.cjs');

class Trade {
  static async create(tradeData) {
    const {
      userId,
      signalId,
      tradeId,
      pair,
      side,
      type = 'MARKET',
      quantity,
      entryPrice,
      stopLoss,
      takeProfit,
      fees = 0,
      notes
    } = tradeData;

    const sql = `
      INSERT INTO trades (
        user_id, signal_id, trade_id, pair, side, type, 
        quantity, entry_price, stop_loss, take_profit, fees, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      userId, signalId, tradeId, pair, side, type,
      quantity, entryPrice, stopLoss, takeProfit, fees, notes
    ];

    const result = await database.query(sql, params);
    
    // Update portfolio holdings
    const Portfolio = require('./Portfolio.cjs');
    await Portfolio.updateHolding(userId, pair.replace('USDT', ''), quantity, entryPrice);
    
    return result.insertId;
  }

  static async findById(id) {
    const sql = `
      SELECT t.*, u.username, s.confidence as signal_confidence
      FROM trades t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN signals s ON t.signal_id = s.id
      WHERE t.id = ?
    `;
    
    const trades = await database.query(sql, [id]);
    return trades.length > 0 ? trades[0] : null;
  }

  static async findByUser(userId, limit = 50, offset = 0, status = null) {
    let sql = `
      SELECT t.*, s.confidence as signal_confidence
      FROM trades t
      LEFT JOIN signals s ON t.signal_id = s.id
      WHERE t.user_id = ?
    `;
    
    const params = [userId];
    
    if (status) {
      sql += ' AND t.status = ?';
      params.push(status);
    }
    
    sql += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    return await database.query(sql, params);
  }

  static async findOpenTrades(userId) {
    const sql = `
      SELECT t.*, s.confidence as signal_confidence
      FROM trades t
      LEFT JOIN signals s ON t.signal_id = s.id
      WHERE t.user_id = ? AND t.status = 'OPEN'
      ORDER BY t.created_at DESC
    `;
    
    return await database.query(sql, [userId]);
  }

  static async closeTrade(id, exitPrice, fees = 0, notes = null) {
    const trade = await Trade.findById(id);
    if (!trade) {
      throw new Error('Trade not found');
    }

    // Calculate P&L
    const quantity = parseFloat(trade.quantity);
    const entryPrice = parseFloat(trade.entry_price);
    const totalFees = parseFloat(trade.fees) + parseFloat(fees);
    
    let realizedPnl;
    if (trade.side === 'BUY') {
      realizedPnl = (exitPrice - entryPrice) * quantity - totalFees;
    } else {
      realizedPnl = (entryPrice - exitPrice) * quantity - totalFees;
    }
    
    const pnlPercentage = (realizedPnl / (entryPrice * quantity)) * 100;
    const durationMinutes = Math.floor((Date.now() - new Date(trade.created_at).getTime()) / (1000 * 60));

    const sql = `
      UPDATE trades 
      SET exit_price = ?, fees = ?, realized_pnl = ?, pnl_percentage = ?, 
          status = 'CLOSED', close_time = NOW(), duration_minutes = ?, notes = ?
      WHERE id = ?
    `;

    await database.query(sql, [
      exitPrice, totalFees, realizedPnl, pnlPercentage, 
      durationMinutes, notes, id
    ]);

    // Update signal status if linked
    if (trade.signal_id) {
      const Signal = require('./Signal.cjs');
      await Signal.updateStatus(trade.signal_id, 'EXECUTED');
    }

    return await Trade.findById(id);
  }

  static async cancelTrade(id, reason = null) {
    const sql = `
      UPDATE trades 
      SET status = 'CANCELLED', close_time = NOW(), notes = ?
      WHERE id = ? AND status = 'OPEN'
    `;

    const result = await database.query(sql, [reason, id]);
    return result.affectedRows > 0;
  }

  static async updateStopLoss(id, stopLoss) {
    const sql = 'UPDATE trades SET stop_loss = ?, updated_at = NOW() WHERE id = ?';
    await database.query(sql, [stopLoss, id]);
  }

  static async updateTakeProfit(id, takeProfit) {
    const sql = 'UPDATE trades SET take_profit = ?, updated_at = NOW() WHERE id = ?';
    await database.query(sql, [takeProfit, id]);
  }

  static async getTradeHistory(userId, filters = {}) {
    let sql = `
      SELECT t.*, s.confidence as signal_confidence
      FROM trades t
      LEFT JOIN signals s ON t.signal_id = s.id
      WHERE t.user_id = ?
    `;
    
    const params = [userId];
    
    // Apply filters
    if (filters.pair) {
      sql += ' AND t.pair = ?';
      params.push(filters.pair);
    }
    
    if (filters.status) {
      sql += ' AND t.status = ?';
      params.push(filters.status);
    }
    
    if (filters.side) {
      sql += ' AND t.side = ?';
      params.push(filters.side);
    }
    
    if (filters.dateFrom) {
      sql += ' AND t.created_at >= ?';
      params.push(filters.dateFrom);
    }
    
    if (filters.dateTo) {
      sql += ' AND t.created_at <= ?';
      params.push(filters.dateTo);
    }
    
    sql += ' ORDER BY t.created_at DESC';
    
    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(filters.limit);
    }
    
    return await database.query(sql, params);
  }

  static async getTradeStats(userId, days = 30) {
    const sql = `
      SELECT 
        COUNT(*) as total_trades,
        SUM(CASE WHEN realized_pnl > 0 THEN 1 ELSE 0 END) as winning_trades,
        SUM(CASE WHEN realized_pnl < 0 THEN 1 ELSE 0 END) as losing_trades,
        SUM(realized_pnl) as total_pnl,
        AVG(realized_pnl) as avg_pnl,
        MAX(realized_pnl) as best_trade,
        MIN(realized_pnl) as worst_trade,
        AVG(duration_minutes) as avg_duration,
        SUM(fees) as total_fees
      FROM trades 
      WHERE user_id = ? 
        AND status = 'CLOSED' 
        AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    `;
    
    const result = await database.query(sql, [userId, days]);
    const stats = result[0];
    
    // Calculate win rate
    if (stats.total_trades > 0) {
      stats.win_rate = (stats.winning_trades / stats.total_trades) * 100;
    } else {
      stats.win_rate = 0;
    }
    
    return stats;
  }

  static async getPairPerformance(userId, days = 30) {
    const sql = `
      SELECT 
        pair,
        COUNT(*) as trades_count,
        SUM(realized_pnl) as total_pnl,
        AVG(realized_pnl) as avg_pnl,
        SUM(CASE WHEN realized_pnl > 0 THEN 1 ELSE 0 END) as winning_trades,
        (SUM(CASE WHEN realized_pnl > 0 THEN 1 ELSE 0 END) / COUNT(*)) * 100 as win_rate
      FROM trades 
      WHERE user_id = ? 
        AND status = 'CLOSED' 
        AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY pair
      ORDER BY total_pnl DESC
    `;
    
    return await database.query(sql, [userId, days]);
  }

}

module.exports = Trade;