import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, TrendingDown, RefreshCw, Sparkles, Target, ChartBar as BarChart3 } from 'lucide-react';
import SignalCard from './SignalCard';
import EnchantedButton from './EnchantedButton';
import { useTrading } from '../context/TradingContext';

const SignalGenerator = () => {
  const { signals, isLoading, actions } = useTrading();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const [timeframe, setTimeframe] = useState('1h');
  const [signalCount, setSignalCount] = useState(0);

  const tradingPairs = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT', 'DOTUSDT'];
  const timeframes = ['5m', '15m', '1h', '4h', '1d'];

  useEffect(() => {
    setSignalCount(signals?.length || 0);
  }, [signals]);

  const generateSignal = async () => {
    setIsGenerating(true);
    
    try {
      await actions.generateSignal(selectedPair, timeframe);
    } catch (error) {
      console.error('Error generating signal:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearSignals = () => {
    setSignalCount(0);
    // In a real app, this would call an API to clear signals
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
            Enchanted Signal Generator
          </h1>
          <p className="text-xl text-gray-400 mb-6">Harness the power of mystical trading algorithms</p>
          <div className="flex items-center justify-center space-x-4 text-sm text-purple-300">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Accuracy: 87.3%</span>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Signals Generated: {signalCount}</span>
            </div>
          </div>
        </motion.div>

        {/* Control Panel */}
        <motion.div
          className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-sm border border-purple-500/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <span>Signal Configuration</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Trading Pair Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Trading Pair</label>
              <select
                value={selectedPair}
                onChange={(e) => setSelectedPair(e.target.value)}
                className="w-full p-3 rounded-xl bg-black/30 border border-purple-500/30 text-white focus:border-purple-400 focus:outline-none transition-colors"
              >
                {tradingPairs.map(pair => (
                  <option key={pair} value={pair} className="bg-gray-900">{pair}</option>
                ))}
              </select>
            </div>

            {/* Timeframe Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Timeframe</label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full p-3 rounded-xl bg-black/30 border border-purple-500/30 text-white focus:border-purple-400 focus:outline-none transition-colors"
              >
                {timeframes.map(tf => (
                  <option key={tf} value={tf} className="bg-gray-900">{tf}</option>
                ))}
              </select>
            </div>

            {/* Signal Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Signal Type</label>
              <select className="w-full p-3 rounded-xl bg-black/30 border border-purple-500/30 text-white focus:border-purple-400 focus:outline-none transition-colors">
                <option value="all" className="bg-gray-900">All Signals</option>
                <option value="buy" className="bg-gray-900">Buy Only</option>
                <option value="sell" className="bg-gray-900">Sell Only</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <EnchantedButton
              onClick={generateSignal}
              disabled={isGenerating}
              className="flex items-center space-x-2"
            >
              {isGenerating ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Zap className="w-5 h-5" />
              )}
              <span>{isGenerating ? 'Generating...' : 'Generate Signal'}</span>
            </EnchantedButton>
            
            <EnchantedButton
              variant="secondary"
              onClick={actions.refreshData}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Refresh</span>
            </EnchantedButton>
            
            <EnchantedButton
              variant="danger"
              onClick={clearSignals}
              className="flex items-center space-x-2"
            >
              <span>Clear All</span>
            </EnchantedButton>
          </div>
        </motion.div>

        {/* Signal Statistics */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {[
            { label: 'Total Signals', value: signalCount, icon: Zap, color: 'purple' },
            { label: 'Buy Signals', value: signals.filter(s => s.type === 'BUY').length, icon: TrendingUp, color: 'green' },
            { label: 'Sell Signals', value: signals.filter(s => s.type === 'SELL').length, icon: TrendingDown, color: 'red' },
            { label: 'Avg Confidence', value: `${signals.length > 0 ? (signals.reduce((acc, s) => acc + s.confidence, 0) / signals.length).toFixed(1) : 0}%`, icon: Target, color: 'blue' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="p-4 rounded-xl bg-gradient-to-br from-purple-900/30 to-indigo-900/30 backdrop-blur-sm border border-purple-500/20"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                <span className="text-2xl font-bold">{stat.value}</span>
              </div>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Generated Signals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <span>Generated Signals</span>
          </h2>
          
          {signals.length === 0 ? (
            <motion.div
              className="text-center py-12 px-6 rounded-2xl bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-sm border border-purple-500/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No Signals Generated Yet</h3>
              <p className="text-gray-500">Click "Generate Signal" to create your first enchanted trading signal</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(signals || []).map((signal, index) => (
                <motion.div
                  key={signal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <SignalCard signal={signal} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SignalGenerator;