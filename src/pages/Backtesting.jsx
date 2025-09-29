import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TestTube, 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign,
  BarChart3,
  Target,
  Clock
} from 'lucide-react';
import EnchantedButton from '../components/EnchantedButton';

const Backtesting = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testConfig, setTestConfig] = useState({
    symbol: 'BTCUSDT',
    strategy: 'RSI_MACD',
    startDate: '2023-01-01',
    endDate: '2024-01-01',
    initialCapital: 10000,
    riskPerTrade: 2,
    stopLoss: 2,
    takeProfit: 6
  });

  const [results, setResults] = useState({
    totalTrades: 156,
    winningTrades: 107,
    losingTrades: 49,
    winRate: 68.6,
    totalReturn: 2847.50,
    returnPercentage: 28.48,
    maxDrawdown: 8.5,
    sharpeRatio: 1.85,
    profitFactor: 2.34,
    avgWin: 45.20,
    avgLoss: -18.75,
    largestWin: 234.50,
    largestLoss: -89.25
  });

  const [progress, setProgress] = useState(0);

  const strategies = [
    { value: 'RSI_MACD', label: 'RSI + MACD Crossover' },
    { value: 'MA_CROSSOVER', label: 'Moving Average Crossover' },
    { value: 'BOLLINGER_BANDS', label: 'Bollinger Bands Mean Reversion' },
    { value: 'MOMENTUM', label: 'Momentum Strategy' },
    { value: 'CUSTOM', label: 'Custom Strategy' }
  ];

  const symbols = [
    'BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'SOLUSDT', 'DOTUSDT',
    'LINKUSDT', 'AVAXUSDT', 'MATICUSDT', 'ATOMUSDT', 'NEARUSDT'
  ];

  const handleConfigChange = (field, value) => {
    setTestConfig(prev => ({ ...prev, [field]: value }));
  };

  const startBacktest = () => {
    setIsRunning(true);
    setProgress(0);
    
    // Simulate backtest progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          // Update results when backtest completes
          setResults({
            totalTrades: 156 + Math.floor(Math.random() * 20),
            winningTrades: 107 + Math.floor(Math.random() * 10),
            losingTrades: 49 + Math.floor(Math.random() * 10),
            winRate: 65 + Math.random() * 10,
            totalReturn: 2500 + Math.random() * 1000,
            returnPercentage: 25 + Math.random() * 10,
            maxDrawdown: 5 + Math.random() * 5,
            sharpeRatio: 1.5 + Math.random() * 0.5,
            profitFactor: 2 + Math.random() * 0.5,
            avgWin: 40 + Math.random() * 20,
            avgLoss: -(15 + Math.random() * 10),
            largestWin: 200 + Math.random() * 100,
            largestLoss: -(50 + Math.random() * 50)
          });
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const stopBacktest = () => {
    setIsRunning(false);
    setProgress(0);
  };

  const resetBacktest = () => {
    setProgress(0);
    // Reset results if needed
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  };

  const formatPercentage = (percentage) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
              <TestTube className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Backtesting</h1>
              <p className="text-gray-400">Test your trading strategies with historical data</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {!isRunning ? (
              <EnchantedButton
                onClick={startBacktest}
                className="flex items-center space-x-2"
              >
                <Play className="h-4 w-4" />
                <span>Start Test</span>
              </EnchantedButton>
            ) : (
              <EnchantedButton
                onClick={stopBacktest}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700"
              >
                <Pause className="h-4 w-4" />
                <span>Stop Test</span>
              </EnchantedButton>
            )}
            
            <button
              onClick={resetBacktest}
              className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-gradient-to-br from-purple-800/30 to-indigo-800/30 backdrop-blur-lg rounded-xl border border-purple-500/20 p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Configuration</span>
              </h2>

              <div className="space-y-4">
                {/* Symbol Selection */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Trading Pair
                  </label>
                  <select
                    value={testConfig.symbol}
                    onChange={(e) => handleConfigChange('symbol', e.target.value)}
                    className="w-full px-3 py-2 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400 transition-colors"
                  >
                    {symbols.map(symbol => (
                      <option key={symbol} value={symbol}>{symbol}</option>
                    ))}
                  </select>
                </div>

                {/* Strategy Selection */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Strategy
                  </label>
                  <select
                    value={testConfig.strategy}
                    onChange={(e) => handleConfigChange('strategy', e.target.value)}
                    className="w-full px-3 py-2 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400 transition-colors"
                  >
                    {strategies.map(strategy => (
                      <option key={strategy.value} value={strategy.value}>
                        {strategy.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={testConfig.startDate}
                      onChange={(e) => handleConfigChange('startDate', e.target.value)}
                      className="w-full px-3 py-2 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={testConfig.endDate}
                      onChange={(e) => handleConfigChange('endDate', e.target.value)}
                      className="w-full px-3 py-2 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400 transition-colors"
                    />
                  </div>
                </div>

                {/* Initial Capital */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Initial Capital ($)
                  </label>
                  <input
                    type="number"
                    value={testConfig.initialCapital}
                    onChange={(e) => handleConfigChange('initialCapital', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400 transition-colors"
                  />
                </div>

                {/* Risk Management */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Risk per Trade (%)
                    </label>
                    <input
                      type="number"
                      min="0.1"
                      max="10"
                      step="0.1"
                      value={testConfig.riskPerTrade}
                      onChange={(e) => handleConfigChange('riskPerTrade', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Stop Loss (%)
                    </label>
                    <input
                      type="number"
                      min="0.5"
                      max="10"
                      step="0.1"
                      value={testConfig.stopLoss}
                      onChange={(e) => handleConfigChange('stopLoss', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Take Profit (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    step="0.1"
                    value={testConfig.takeProfit}
                    onChange={(e) => handleConfigChange('takeProfit', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400 transition-colors"
                  />
                </div>
              </div>

              {/* Progress Bar */}
              {isRunning && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm">Progress</span>
                    <span className="text-purple-400 text-sm">{progress}%</span>
                  </div>
                  <div className="w-full bg-purple-900/30 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Results Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-800/30 to-emerald-800/30 backdrop-blur-lg rounded-xl p-4 border border-green-500/20">
                <div className="flex items-center mb-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-green-400">{formatCurrency(results.totalReturn)}</p>
                <p className="text-gray-400 text-sm">Total Return</p>
                <p className="text-green-400 text-sm">{formatPercentage(results.returnPercentage)}</p>
              </div>

              <div className="bg-gradient-to-br from-blue-800/30 to-cyan-800/30 backdrop-blur-lg rounded-xl p-4 border border-blue-500/20">
                <div className="flex items-center mb-2">
                  <Target className="h-5 w-5 text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-blue-400">{results.winRate}%</p>
                <p className="text-gray-400 text-sm">Win Rate</p>
                <p className="text-blue-400 text-sm">{results.winningTrades}/{results.totalTrades}</p>
              </div>

              <div className="bg-gradient-to-br from-red-800/30 to-pink-800/30 backdrop-blur-lg rounded-xl p-4 border border-red-500/20">
                <div className="flex items-center mb-2">
                  <TrendingDown className="h-5 w-5 text-red-400" />
                </div>
                <p className="text-2xl font-bold text-red-400">{results.maxDrawdown}%</p>
                <p className="text-gray-400 text-sm">Max Drawdown</p>
              </div>

              <div className="bg-gradient-to-br from-purple-800/30 to-indigo-800/30 backdrop-blur-lg rounded-xl p-4 border border-purple-500/20">
                <div className="flex items-center mb-2">
                  <BarChart3 className="h-5 w-5 text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-purple-400">{results.sharpeRatio}</p>
                <p className="text-gray-400 text-sm">Sharpe Ratio</p>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="bg-gradient-to-br from-purple-800/20 to-indigo-800/20 backdrop-blur-lg rounded-xl border border-purple-500/20 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Detailed Results</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-purple-900/20 rounded-lg">
                    <span className="text-gray-400">Total Trades</span>
                    <span className="text-white font-medium">{results.totalTrades}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-purple-900/20 rounded-lg">
                    <span className="text-gray-400">Winning Trades</span>
                    <span className="text-green-400 font-medium">{results.winningTrades}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-purple-900/20 rounded-lg">
                    <span className="text-gray-400">Losing Trades</span>
                    <span className="text-red-400 font-medium">{results.losingTrades}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-purple-900/20 rounded-lg">
                    <span className="text-gray-400">Profit Factor</span>
                    <span className="text-white font-medium">{results.profitFactor}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-purple-900/20 rounded-lg">
                    <span className="text-gray-400">Average Win</span>
                    <span className="text-green-400 font-medium">{formatCurrency(results.avgWin)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-purple-900/20 rounded-lg">
                    <span className="text-gray-400">Average Loss</span>
                    <span className="text-red-400 font-medium">{formatCurrency(results.avgLoss)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-purple-900/20 rounded-lg">
                    <span className="text-gray-400">Largest Win</span>
                    <span className="text-green-400 font-medium">{formatCurrency(results.largestWin)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-purple-900/20 rounded-lg">
                    <span className="text-gray-400">Largest Loss</span>
                    <span className="text-red-400 font-medium">{formatCurrency(results.largestLoss)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Placeholder */}
            <div className="bg-gradient-to-br from-purple-800/20 to-indigo-800/20 backdrop-blur-lg rounded-xl border border-purple-500/20 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Equity Curve</h3>
              <div className="h-64 bg-purple-900/20 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-purple-400 mx-auto mb-2" />
                  <p className="text-gray-400">Equity curve chart will be displayed here</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Backtesting;