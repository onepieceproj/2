import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Zap, Shield, AlertTriangle, Target, BarChart3, DollarSign, Percent } from 'lucide-react';

const MarginTrading = () => {
  const [selectedPair, setSelectedPair] = useState('BTCUSDT');
  const [leverage, setLeverage] = useState(10);
  const [position, setPosition] = useState('long');
  const [amount, setAmount] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  
  const [marginBalance, setMarginBalance] = useState({
    totalBalance: 15000,
    availableMargin: 12500,
    usedMargin: 2500,
    marginLevel: 600
  });

  const [openPositions, setOpenPositions] = useState([
    {
      id: 1,
      symbol: 'BTCUSDT',
      side: 'long',
      size: 0.5,
      entryPrice: 42800,
      currentPrice: 43250,
      leverage: 10,
      pnl: 225.00,
      pnlPercent: 5.25,
      margin: 2140
    },
    {
      id: 2,
      symbol: 'ETHUSDT',
      side: 'short',
      size: 2.0,
      entryPrice: 2680,
      currentPrice: 2651,
      leverage: 5,
      pnl: 58.00,
      pnlPercent: 1.08,
      margin: 1072
    }
  ]);

  const [marginData, setMarginData] = useState([
    { symbol: 'BTCUSDT', price: 43250.50, change: 2.98, funding: 0.01 },
    { symbol: 'ETHUSDT', price: 2650.75, change: -1.68, funding: -0.005 },
    { symbol: 'BNBUSDT', price: 315.80, change: 2.75, funding: 0.008 },
    { symbol: 'ADAUSDT', price: 0.4850, change: 2.64, funding: 0.012 }
  ]);

  const leverageOptions = [1, 2, 3, 5, 10, 20, 25, 50, 75, 100, 125];

  const handleOpenPosition = () => {
    const newPosition = {
      id: openPositions.length + 1,
      symbol: selectedPair,
      side: position,
      size: parseFloat(amount),
      entryPrice: marginData.find(m => m.symbol === selectedPair)?.price || 0,
      currentPrice: marginData.find(m => m.symbol === selectedPair)?.price || 0,
      leverage,
      pnl: 0,
      pnlPercent: 0,
      margin: (parseFloat(amount) * (marginData.find(m => m.symbol === selectedPair)?.price || 0)) / leverage
    };
    setOpenPositions([...openPositions, newPosition]);
    setAmount('');
  };

  const closePosition = (positionId) => {
    setOpenPositions(openPositions.filter(pos => pos.id !== positionId));
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
            Margin Trading
          </h1>
          <p className="text-gray-400">Trade with leverage and manage your margin positions</p>
        </motion.div>

        {/* Margin Account Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-lg rounded-xl p-4 border border-purple-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Balance</p>
                  <p className="text-white text-xl font-bold">${marginBalance.totalBalance.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-400" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 backdrop-blur-lg rounded-xl p-4 border border-green-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Available Margin</p>
                  <p className="text-white text-xl font-bold">${marginBalance.availableMargin.toLocaleString()}</p>
                </div>
                <Shield className="h-8 w-8 text-green-400" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-900/50 to-red-900/50 backdrop-blur-lg rounded-xl p-4 border border-orange-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Used Margin</p>
                  <p className="text-white text-xl font-bold">${marginBalance.usedMargin.toLocaleString()}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-400" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 backdrop-blur-lg rounded-xl p-4 border border-blue-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Margin Level</p>
                  <p className="text-white text-xl font-bold">{marginBalance.marginLevel}%</p>
                </div>
                <Percent className="h-8 w-8 text-blue-400" />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trading Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-purple-400" />
                Open Position
              </h2>

              {/* Pair Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Trading Pair</label>
                <select
                  value={selectedPair}
                  onChange={(e) => setSelectedPair(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                >
                  {marginData.map(pair => (
                    <option key={pair.symbol} value={pair.symbol}>{pair.symbol}</option>
                  ))}
                </select>
              </div>

              {/* Position Type */}
              <div className="mb-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPosition('long')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                      position === 'long'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Long
                  </button>
                  <button
                    onClick={() => setPosition('short')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                      position === 'short'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Short
                  </button>
                </div>
              </div>

              {/* Leverage Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Leverage: {leverage}x</label>
                <div className="grid grid-cols-4 gap-2">
                  {leverageOptions.slice(0, 8).map(lev => (
                    <button
                      key={lev}
                      onClick={() => setLeverage(lev)}
                      className={`py-1 px-2 rounded text-sm font-medium transition-all ${
                        leverage === lev
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {lev}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Position Size</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Stop Loss */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Stop Loss (Optional)</label>
                <input
                  type="number"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Take Profit */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Take Profit (Optional)</label>
                <input
                  type="number"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Open Position Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleOpenPosition}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  position === 'long'
                    ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400'
                    : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400'
                } text-white shadow-lg`}
              >
                Open {position.toUpperCase()} Position
              </motion.button>
            </div>
          </motion.div>

          {/* Market Data & Positions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Open Positions */}
            <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2 text-purple-400" />
                Open Positions
              </h2>
              <div className="space-y-4">
                {openPositions.map((pos) => (
                  <div key={pos.id} className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          pos.side === 'long' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <div className="text-white font-medium">{pos.symbol}</div>
                          <div className="text-sm text-gray-400">{pos.leverage}x {pos.side.toUpperCase()}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          pos.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)}
                        </div>
                        <div className={`text-sm ${
                          pos.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {pos.pnlPercent >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400">Size</div>
                        <div className="text-white">{pos.size}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Entry Price</div>
                        <div className="text-white">${pos.entryPrice.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Current Price</div>
                        <div className="text-white">${pos.currentPrice.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => closePosition(pos.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Close Position
                      </button>
                    </div>
                  </div>
                ))}
                {openPositions.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    No open positions
                  </div>
                )}
              </div>
            </div>

            {/* Market Data */}
            <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-purple-400" />
                Margin Markets
              </h2>
              <div className="space-y-3">
                {marginData.map((pair) => (
                  <motion.div
                    key={pair.symbol}
                    whileHover={{ scale: 1.01 }}
                    className="bg-gray-800/50 rounded-lg p-4 cursor-pointer hover:bg-gray-700/50 transition-all"
                    onClick={() => setSelectedPair(pair.symbol)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-semibold text-white">{pair.symbol}</h3>
                          <div className="text-2xl font-bold text-white">
                            ${pair.price.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`flex items-center text-sm mb-1 ${
                          pair.change >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {pair.change >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                          {pair.change >= 0 ? '+' : ''}{pair.change}%
                        </div>
                        <div className="text-sm text-gray-400">
                          Funding: {pair.funding >= 0 ? '+' : ''}{pair.funding}%
                        </div>
                      </div>
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

export default MarginTrading;