const database = require('../config/database.cjs');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const {
      username,
      email,
      password,
      firstName = null,
      lastName = null,
      phone = null,
      location = null,
      bio = null,
      tradingExperience = 'Beginner',
      riskTolerance = 'Medium',
      preferredMarkets = ['Spot']
    } = userData;

    // Check for duplicate email
    const existingEmail = await database.query(
      'SELECT id FROM users WHERE email = ? AND is_active = TRUE',
      [email]
    );
    if (existingEmail.length > 0) {
      throw new Error('Email already registered');
    }

    // Check for duplicate username
    const existingUsername = await database.query(
      'SELECT id FROM users WHERE username = ? AND is_active = TRUE',
      [username]
    );
    if (existingUsername.length > 0) {
      throw new Error('Username already taken');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (
        username, email, password_hash, first_name, last_name, 
        phone, location, bio, trading_experience, risk_tolerance, preferred_markets
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      username,
      email,
      passwordHash,
      firstName,
      lastName,
      phone,
      location,
      bio,
      tradingExperience,
      riskTolerance,
      JSON.stringify(preferredMarkets)
    ];

    // Insert user
    const result = await database.query(sql, params);
    const userId = result.insertId;

    // Create default portfolio
    await database.query(
      'INSERT INTO portfolio (user_id, total_balance, available_balance) VALUES (?, 10000.00, 10000.00)',
      [userId]
    );

    // Create default settings
    await database.query('INSERT INTO user_settings (user_id) VALUES (?)', [userId]);

    return userId;
  }

  static async findById(id) {
    const sql = `
      SELECT u.*, 
             JSON_UNQUOTE(u.preferred_markets) as preferred_markets_json
      FROM users u 
      WHERE u.id = ? AND u.is_active = TRUE
    `;
    
    const users = await database.query(sql, [id]);
    if (users.length === 0) return null;

    const user = users[0];
    user.preferred_markets = JSON.parse(user.preferred_markets_json || '[]');
    delete user.preferred_markets_json;
    delete user.password_hash;

    return user;
  }

  static async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ? AND is_active = TRUE';
    const users = await database.query(sql, [email]);
    return users.length > 0 ? users[0] : null;
  }

  static async findByUsername(username) {
    const sql = 'SELECT * FROM users WHERE username = ? AND is_active = TRUE';
    const users = await database.query(sql, [username]);
    return users.length > 0 ? users[0] : null;
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async update(id, updateData) {
    const allowedFields = [
      'first_name', 'last_name', 'phone', 'location', 'bio',
      'trading_experience', 'risk_tolerance', 'preferred_markets'
    ];

    const updates = [];
    const params = [];

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        params.push(key === 'preferred_markets' ? JSON.stringify(updateData[key]) : updateData[key]);
      }
    });

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    params.push(id);
    const sql = `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`;
    
    await database.query(sql, params);
    return await User.findById(id);
  }

  static async updatePassword(id, newPassword) {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const sql = 'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?';
    await database.query(sql, [passwordHash, id]);
  }

  static async deactivate(id) {
    const sql = 'UPDATE users SET is_active = FALSE, updated_at = NOW() WHERE id = ?';
    await database.query(sql, [id]);
  }

  static async getStats(id) {
    const sql = `
      SELECT 
        p.total_trades,
        p.winning_trades,
        p.win_rate,
        p.total_pnl,
        p.max_drawdown,
        p.sharpe_ratio,
        COALESCE(MAX(t.realized_pnl), 0) as best_trade,
        DATEDIFF(NOW(), u.created_at) as trading_days
      FROM users u
      LEFT JOIN portfolio p ON u.id = p.user_id
      LEFT JOIN trades t ON u.id = t.user_id AND t.status = 'CLOSED'
      WHERE u.id = ?
      GROUP BY u.id, p.total_trades, p.winning_trades, p.win_rate, p.total_pnl, p.max_drawdown, p.sharpe_ratio
    `;

    const stats = await database.query(sql, [id]);
    return stats.length > 0 ? stats[0] : {
      total_trades: 0,
      winning_trades: 0,
      win_rate: 0,
      total_pnl: 0,
      max_drawdown: 0,
      sharpe_ratio: 0,
      best_trade: 0,
      trading_days: 0
    };
  }
}

module.exports = User;
