import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, TrendingUp, TrendingDown, Target, Calculator, PieChart, BarChart3 } from 'lucide-react';

const RiskManagement = () => {
  const [riskSettings, setRiskSettings] = useState({
    maxRiskPerTrade: 2,
    maxDailyLoss: 5,
    maxPositions: 5,
    stopLossPercentage: 3,
    takeProfitRatio: 2
  });

  const [portfolioRisk, setPortfolioRisk] = useState({
    totalExposure: 45000,
    currentRisk: 2.3,
    maxDrawdown: 8.5,
    sharpeRatio: 1.85,
    winRate: 68.5,
    riskRewardRatio: 1.75
  });

  const [positionSizing, setPositionSizing] = useState({
    accountBalance: 50000,
    riskAmount: 1000,
    entryPrice: 43250,
    stopLoss: 41900,
    positionSize: 0
  });

  const [riskMetrics, setRiskMetrics] = useState([
    { name: 'Value at Risk (VaR)', value: '$2,450', status: 'good', description: '95% confidence, 1-day horizon' },
    { name: 'Maximum Drawdown', value: '8.5%', status: 'warning', description: 'Largest peak-to-trough decline' },
    { name: 'Correlation Risk', value: 'Medium', status: 'neutral', description: 'Portfolio diversification level' },
    { name: 'Leverage Risk', value: '3.2x', status: 'good', description: 'Average position leverage' }
  ]);

  const [riskAlerts, setRiskAlerts] = useState([
    { id: 1, type: 'warning', message: 'Daily loss limit approaching (4.2% of 5%)', time: '2 minutes ago' },
    { id: 2, type: 'info', message: 'BTC correlation with portfolio increased to 0.85', time: '15 minutes ago' },
    { id: 3, type: 'success', message: 'Risk-adjusted return improved by 12%', time: '1 hour ago' }
  ]);

  useEffect(() => {
    calculatePositionSize();
  }, [positionSizing.accountBalance, positionSizing.riskAmount, positionSizing.entryPrice, positionSizing.stopLoss]);

  const calculatePositionSize = () => {
    const { accountBalance, riskAmount, entryPrice, stopLoss } = positionSizing;
    if (entryPrice && stopLoss && entryPrice !== stopLoss) {
      const riskPerShare = Math.abs(entryPrice - stopLoss);
      const calculatedSize = riskAmount / riskPerShare;
      setPositionSizing(prev => ({ ...prev, positionSize: calculatedSize }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'danger': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'success': return 'border-green-500/30 bg-green-900/20';
      case 'warning': return 'border-yellow-500/30 bg-yellow-900/20';
      case 'danger': return 'border-red-500/30 bg-red-900/20';
      default: return 'border-blue-500/30 bg-blue-900/20';
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-2">
            Risk Management
          </h1>
          <p className="text-gray-400">Monitor and control your trading risks with advanced analytics</p>
        </motion.div>

        {/* Risk Overview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Portfolio Risk</h3>
              <Shield className="h-6 w-6 text-purple-400" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Current Risk</span>
                <span className="text-white font-medium">{portfolioRisk.currentRisk}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Max Drawdown</span>
                <span className="text-yellow-400 font-medium">{portfolioRisk.maxDrawdown}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Sharpe Ratio</span>
                <span className="text-green-400 font-medium">{portfolioRisk.sharpeRatio}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 backdrop-blur-lg rounded-2xl p-6 border border-green-500/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Performance</h3>
              <TrendingUp className="h-6 w-6 text-green-400" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Win Rate</span>
                <span className="text-white font-medium">{portfolioRisk.winRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Risk/Reward</span>
                <span className="text-green-400 font-medium">{portfolioRisk.riskRewardRatio}:1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Exposure</span>
                <span className="text-white font-medium">${portfolioRisk.totalExposure.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-900/50 to-red-900/50 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Risk Limits</h3>
              <AlertTriangle className="h-6 w-6 text-orange-400" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Max Risk/Trade</span>
                <span className="text-white font-medium">{riskSettings.maxRiskPerTrade}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Daily Loss Limit</span>
                <span className="text-orange-400 font-medium">{riskSettings.maxDailyLoss}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Max Positions</span>
                <span className="text-white font-medium">{riskSettings.maxPositions}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Position Sizing Calculator */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Calculator className="h-5 w-5 mr-2 text-purple-400" />
                Position Sizing Calculator
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Account Balance</label>
                  <input
                    type="number"
                    value={positionSizing.accountBalance}
                    onChange={(e) => setPositionSizing(prev => ({ ...prev, accountBalance: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Risk Amount ($)</label>
                  <input
                    type="number"
                    value={positionSizing.riskAmount}
                    onChange={(e) => setPositionSizing(prev => ({ ...prev, riskAmount: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Entry Price</label>
                    <input
                      type="number"
                      value={positionSizing.entryPrice}
                      onChange={(e) => setPositionSizing(prev => ({ ...prev, entryPrice: parseFloat(e.target.value) || 0 }))}
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Stop Loss</label>
                    <input
                      type="number"
                      value={positionSizing.stopLoss}
                      onChange={(e) => setPositionSizing(prev => ({ ...prev, stopLoss: parseFloat(e.target.value) || 0 }))}
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
                
                <div className="bg-gray-800/30 rounded-lg p-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Recommended Position Size:</span>
                    <span className="text-2xl font-bold text-purple-400">
                      {positionSizing.positionSize.toFixed(6)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 mt-2">
                    Risk per unit: ${Math.abs(positionSizing.entryPrice - positionSizing.stopLoss).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Settings */}
            <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2 text-purple-400" />
                Risk Settings
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Risk Per Trade: {riskSettings.maxRiskPerTrade}%
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="10"
                    step="0.5"
                    value={riskSettings.maxRiskPerTrade}
                    onChange={(e) => setRiskSettings(prev => ({ ...prev, maxRiskPerTrade: parseFloat(e.target.value) }))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Daily Loss: {riskSettings.maxDailyLoss}%
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={riskSettings.maxDailyLoss}
                    onChange={(e) => setRiskSettings(prev => ({ ...prev, maxDailyLoss: parseFloat(e.target.value) }))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Stop Loss Percentage: {riskSettings.stopLossPercentage}%
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={riskSettings.stopLossPercentage}
                    onChange={(e) => setRiskSettings(prev => ({ ...prev, stopLossPercentage: parseFloat(e.target.value) }))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Risk Metrics & Alerts */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Risk Metrics */}
            <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-purple-400" />
                Risk Metrics
              </h2>
              
              <div className="space-y-4">
                {riskMetrics.map((metric, index) => (
                  <div key={index} className="bg-gray-800/30 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-white">{metric.name}</h3>
                      <span className={`font-bold ${getStatusColor(metric.status)}`}>
                        {metric.value}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{metric.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Alerts */}
            <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-purple-400" />
                Risk Alerts
              </h2>
              
              <div className="space-y-3">
                {riskAlerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}
                  >
                    <div className="flex justify-between items-start">
                      <p className="text-white text-sm">{alert.message}</p>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                        {alert.time}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RiskManagement;