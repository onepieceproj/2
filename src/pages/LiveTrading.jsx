import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Play, 
  Pause, 
  Settings, 
  AlertTriangle, 
  CheckCircle,
  Target,
  BarChart3,
  DollarSign,
  Activity
} from 'lucide-react';
import EnchantedButton from '../components/EnchantedButton';
import { useTrading } from '../context/TradingContext';
import TradingService from '../services/TradingService';

const LiveTrading = () => {
  const { signals, portfolio, actions } = useTrading();
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [autoTradeSettings, setAutoTradeSettings] = useState({
    enabled: false,
    maxPositions: 3,
    riskPerTrade: 2,
    minConfidence: 80,
    allowedPairs: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'],
    stopLossPercent: 3,
    takeProfitPercent: 6
  });

  const [liveStats, setLiveStats] = useState({
    activeSignals: 3,
    executedTrades: 12,
    totalPnL: 145.67,
    successRate: 75.5,
    uptime: '00:00:00'
  });

  const [executionLog, setExecutionLog] = useState([
    {
      id: 1,
      timestamp: new Date().toISOString(),
      action: 'Signal Generated',
      pair: 'BTCUSDT',
      status: 'success',
      type: 'BUY',
      amount: '0.1 BTC'
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 300000).toISOString(),
      action: 'Trade Executed',
      pair: 'ETHUSDT',
      status: 'success',
      type: 'SELL',
      amount: '2.5 ETH'
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 600000).toISOString(),
      action: 'Stop Loss Triggered',
      pair: 'BNBUSDT',
      status: 'warning',
      type: 'SELL',
      amount: '10 BNB'
    }
  ]);

  const [riskMonitoring, setRiskMonitoring] = useState({
    currentRisk: 2.3,
    maxRisk: 5.0,
    openPositions: 2,
    maxPositions: 5,
    dailyPnL: 145.67,
    dailyLimit: -500
  });

  useEffect(() => {
    if (isLiveMode) {
      const interval = setInterval(() => {
        // Update live stats
        setLiveStats(prev => ({
          ...prev,
          activeSignals: signals?.length || 0,
          uptime: calculateUptime()
        }));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isLiveMode, signals]);

  const calculateUptime = () => {
    // Calculate uptime since live mode started
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const toggleLiveMode = async () => {
    if (!isLiveMode) {
      // Start live trading
      try {
        await TradingService.startLiveTrading(autoTradeSettings);
        setIsLiveMode(true);
        addToExecutionLog('Live Trading Started', 'SYSTEM', 'success');
      } catch (error) {
        console.error('Failed to start live trading:', error);
        addToExecutionLog('Failed to start live trading: ' + error.message, 'SYSTEM', 'error');
      }
    } else {
      // Stop live trading
      TradingService.stopLiveTrading();
      setIsLiveMode(false);
      addToExecutionLog('Live Trading Stopped', 'SYSTEM', 'warning');
    }
  };

  const addToExecutionLog = (action, pair, status, details = {}) => {
    const logEntry = {
      id: executionLog.length + 1,
      timestamp: new Date().toISOString(),
      action,
      pair,
      status,
      ...details
    };
    setExecutionLog(prev => [logEntry, ...prev.slice(0, 49)]); // Keep last 50 entries
  };

  const handleAutoTradeToggle = () => {
    setAutoTradeSettings(prev => ({
      ...prev,
      enabled: !prev.enabled
    }));
    
    if (isLiveMode) {
      // Restart live trading with new settings
      TradingService.stopLiveTrading();
      setTimeout(() => {
        TradingService.startLiveTrading({
          ...autoTradeSettings,
          enabled: !autoTradeSettings.enabled
        });
      }, 1000);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      default: return <Activity className="h-4 w-4 text-blue-400" />;
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Live Trading</h1>
              <p className="text-gray-400">Automated trading with AI signals</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              isLiveMode ? 'bg-green-900/20 text-green-400' : 'bg-gray-900/20 text-gray-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isLiveMode ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm font-medium">{isLiveMode ? 'LIVE' : 'STOPPED'}</span>
            </div>
            
            <EnchantedButton
              onClick={toggleLiveMode}
              variant={isLiveMode ? 'danger' : 'primary'}
              className="flex items-center space-x-2"
            >
              {isLiveMode ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span>{isLiveMode ? 'Stop' : 'Start'} Live Trading</span>
            </EnchantedButton>
          </div>
        </motion.div>

        {/* Live Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 backdrop-blur-lg rounded-xl p-4 border border-blue-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Signals</p>
                <p className="text-white text-2xl font-bold">{liveStats.activeSignals}</p>
              </div>
              <Target className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 backdrop-blur-lg rounded-xl p-4 border border-green-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Executed Trades</p>
                <p className="text-white text-2xl font-bold">{liveStats.executedTrades}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-lg rounded-xl p-4 border border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Live P&L</p>
                <p className={`text-2xl font-bold ${liveStats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${liveStats.totalPnL.toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-900/50 to-red-900/50 backdrop-blur-lg rounded-xl p-4 border border-orange-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Uptime</p>
                <p className="text-white text-2xl font-bold">{liveStats.uptime}</p>
              </div>
              <Activity className="h-8 w-8 text-orange-400" />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Auto-Trade Configuration */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-purple-400" />
                Auto-Trade Settings
              </h2>

              <div className="space-y-4">
                {/* Enable Auto-Trade */}
                <div className="flex items-center justify-between p-4 bg-purple-900/20 rounded-lg border border-purple-500/20">
                  <span className="text-white font-medium">Enable Auto-Trading</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoTradeSettings.enabled}
                      onChange={handleAutoTradeToggle}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {/* Risk Settings */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Risk per Trade: {autoTradeSettings.riskPerTrade}%
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="10"
                    step="0.5"
                    value={autoTradeSettings.riskPerTrade}
                    onChange={(e) => setAutoTradeSettings(prev => ({ ...prev, riskPerTrade: parseFloat(e.target.value) }))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Min Confidence: {autoTradeSettings.minConfidence}%
                  </label>
                  <input
                    type="range"
                    min="60"
                    max="95"
                    step="5"
                    value={autoTradeSettings.minConfidence}
                    onChange={(e) => setAutoTradeSettings(prev => ({ ...prev, minConfidence: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Max Positions: {autoTradeSettings.maxPositions}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={autoTradeSettings.maxPositions}
                    onChange={(e) => setAutoTradeSettings(prev => ({ ...prev, maxPositions: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Allowed Pairs */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Allowed Trading Pairs
                  </label>
                  <div className="space-y-2">
                    {['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT'].map(pair => (
                      <div key={pair} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={pair}
                          checked={autoTradeSettings.allowedPairs.includes(pair)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAutoTradeSettings(prev => ({
                                ...prev,
                                allowedPairs: [...prev.allowedPairs, pair]
                              }));
                            } else {
                              setAutoTradeSettings(prev => ({
                                ...prev,
                                allowedPairs: prev.allowedPairs.filter(p => p !== pair)
                              }));
                            }
                          }}
                          className="w-4 h-4 text-purple-600 bg-purple-900/30 border-purple-500/30 rounded focus:ring-purple-500 focus:ring-2"
                        />
                        <label htmlFor={pair} className="text-gray-300 text-sm">
                          {pair}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Monitoring */}
            <div className="mt-6 bg-gradient-to-br from-orange-900/50 to-red-900/50 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange-400" />
                Risk Monitoring
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Current Risk</span>
                  <span className={`font-bold ${
                    riskMonitoring.currentRisk > 4 ? 'text-red-400' : 
                    riskMonitoring.currentRisk > 2 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {riskMonitoring.currentRisk}%
                  </span>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      riskMonitoring.currentRisk > 4 ? 'bg-red-500' : 
                      riskMonitoring.currentRisk > 2 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${(riskMonitoring.currentRisk / riskMonitoring.maxRisk) * 100}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Open Positions</span>
                  <span className="text-white font-bold">
                    {riskMonitoring.openPositions}/{riskMonitoring.maxPositions}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Daily P&L</span>
                  <span className={`font-bold ${riskMonitoring.dailyPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${riskMonitoring.dailyPnL.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Execution Log & Live Signals */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Live Signals */}
            <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-purple-400" />
                Live Signals
              </h2>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {signals?.slice(0, 5).map((signal, index) => (
                  <div key={signal.id} className="bg-gray-800/30 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          signal.type === 'BUY' ? 'bg-green-600/20' : 'bg-red-600/20'
                        }`}>
                          {signal.type === 'BUY' ? 
                            <TrendingUp className="w-4 h-4 text-green-400" /> : 
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          }
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{signal.pair}</h3>
                          <p className="text-sm text-gray-400">{signal.timeframe} • {signal.confidence}% confidence</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">${signal.price?.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">{formatTime(signal.timestamp)}</p>
                      </div>
                    </div>
                    
                    {autoTradeSettings.enabled && signal.confidence >= autoTradeSettings.minConfidence && (
                      <div className="mt-3 flex justify-end">
                        <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-xs font-medium">
                          Auto-Execute Eligible
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                
                {(!signals || signals.length === 0) && (
                  <div className="text-center py-8 text-gray-400">
                    <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No active signals. Generate signals to start live trading.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Execution Log */}
            <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-purple-400" />
                Execution Log
              </h2>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {executionLog.map((log) => (
                  <div key={log.id} className="bg-gray-800/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(log.status)}
                        <div>
                          <p className="text-white text-sm font-medium">{log.action}</p>
                          <p className="text-gray-400 text-xs">
                            {log.pair} {log.type && `• ${log.type}`} {log.amount && `• ${log.amount}`}
                          </p>
                        </div>
                      </div>
                      <span className="text-gray-400 text-xs">
                        {formatTime(log.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LiveTrading;