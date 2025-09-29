const express = require('express');
const database = require('../config/database.cjs');
const { authenticateToken } = require('../middleware/auth.cjs');

const router = express.Router();

// Get user settings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const sql = 'SELECT * FROM user_settings WHERE user_id = ?';
    const settings = await database.query(sql, [req.user.userId]);
    
    if (settings.length === 0) {
      // Create default settings if none exist
      const defaultSettings = {
        user_id: req.user.userId,
        testnet_mode: true,
        email_notifications: true,
        push_notifications: true,
        sound_alerts: true,
        default_risk_percentage: 2.00,
        max_positions: 5,
        auto_trade: false,
        dark_mode: true,
        language: 'en',
        currency: 'USD',
        timezone: 'UTC'
      };
      
      const insertSql = `
        INSERT INTO user_settings (
          user_id, testnet_mode, email_notifications, push_notifications,
          sound_alerts, default_risk_percentage, max_positions, auto_trade,
          dark_mode, language, currency, timezone
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      await database.query(insertSql, [
        defaultSettings.user_id, defaultSettings.testnet_mode,
        defaultSettings.email_notifications, defaultSettings.push_notifications,
        defaultSettings.sound_alerts, defaultSettings.default_risk_percentage,
        defaultSettings.max_positions, defaultSettings.auto_trade,
        defaultSettings.dark_mode, defaultSettings.language,
        defaultSettings.currency, defaultSettings.timezone
      ]);
      
      res.json({
        success: true,
        data: defaultSettings
      });
    } else {
      res.json({
        success: true,
        data: settings[0]
      });
    }
  } catch (error) {
    console.error('Settings fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: error.message
    });
  }
});

// Update user settings
router.put('/', authenticateToken, async (req, res) => {
  try {
    const {
      binance_api_key,
      binance_secret_key,
      testnet_mode,
      email_notifications,
      push_notifications,
      sound_alerts,
      default_risk_percentage,
      max_positions,
      auto_trade,
      dark_mode,
      language,
      currency,
      timezone
    } = req.body;

    const sql = `
      UPDATE user_settings SET
        binance_api_key = ?,
        binance_secret_key = ?,
        testnet_mode = ?,
        email_notifications = ?,
        push_notifications = ?,
        sound_alerts = ?,
        default_risk_percentage = ?,
        max_positions = ?,
        auto_trade = ?,
        dark_mode = ?,
        language = ?,
        currency = ?,
        timezone = ?,
        updated_at = NOW()
      WHERE user_id = ?
    `;

    await database.query(sql, [
      binance_api_key, binance_secret_key, testnet_mode,
      email_notifications, push_notifications, sound_alerts,
      default_risk_percentage, max_positions, auto_trade,
      dark_mode, language, currency, timezone,
      req.user.userId
    ]);

    res.json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: error.message
    });
  }
});

module.exports = router;