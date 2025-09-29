import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, Eye, Zap, Target, Activity, PieChart, LineChart } from 'lucide-react';

const MarketAnalysis = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [selectedIndicator, setSelectedIndicator] = useState('RSI');
  const [marketOverview, setMarketOverview] = useState({
    totalMarketCap: 2.1,
    btcDominance: 52.3,
    fearGreedIndex: 74,
    activeCoins: 9847
  });

  const [topMovers, setTopMovers] = useState([
    { symbol: 'SOLUSDT', price: '98.25', change: 8.45, volume: '234K' },
    { symbol: 'ADAUSDT', price: '0.4850', change: 5.64, volume: '892K' },
    { symbol: 'BNBUSDT', price: '315.80', change: 2.75, volume: '45K' },
    { symbol: 'BTCUSDT', price: '43250.50', change: 2.98, volume: '28K' },
    { symbol: 'DOTUSDT', price: '7.25', change: -2.42, volume: '123K' }
  ]);

  const [technicalAnalysis, setTechnicalAnalysis] = useState([
    { symbol: 'BTCUSDT', rsi: 68.5, macd: 'Bullish', sma20: 42800, sma50: 41200, signal: 'BUY' },
    { symbol: 'ETHUSDT', rsi: 72.1, macd: 'Bearish', sma20: 2650, sma50: 2580, signal: 'SELL' },
    { symbol: 'BNBUSDT', rsi: 45.3, macd: 'Bullish', sma20: 315, sma50: 310, signal: 'HOLD' },
    { symbol: 'ADAUSDT', rsi: 82.7, macd: 'Neutral', sma20: 0.48, sma50: 0.45, signal: 'SELL' }
  ]);

  const [marketSentiment, setMarketSentiment] = useState([
    { category: 'Social Media', sentiment: 'Bullish', score: 78, change: 5.2 },
    { category: 'News Sentiment', sentiment: 'Neutral', score: 62, change: -2.1 },
    { category: 'Whale Activity', sentiment: 'Bullish', score: 85, change: 8.7 },
    { category: 'Options Flow', sentiment: 'Bearish', score: 45, change: -12.3 }
  ]);

  const [correlationMatrix, setCorrelationMatrix] = useState([
    { pair: 'BTC-ETH', correlation: 0.85, strength: 'Strong' },
    { pair: 'BTC-BNB', correlation: 0.72, strength: 'Strong' },
    { pair: 'ETH-ADA', correlation: 0.68, strength: 'Moderate' },
    { pair: 'BTC-SOL', correlation: 0.45, strength: 'Weak' }
  ]);

  const timeframes = ['5M', '15M', '1H', '4H', '1D', '1W', '1M'];
  const indicators = ['RSI', 'MACD', 'Bollinger Bands', 'Stochastic', 'Williams %R'];

  const getSentimentColor = (sentiment) => {
    switch (sentiment.toLowerCase()) {
      case 'bullish': return 'text-green-400';
      case 'bearish': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getSignalColor = (signal) => {
    switch (signal.toLowerCase()) {
      case 'buy': return 'bg-green-600';
      case 'sell': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getCorrelationColor = (correlation) => {
    const abs = Math.abs(correlation);
    if (abs >= 0.7) return 'text-red-400';
    if (abs >= 0.4) return 'text-yellow-400';
    return 'text-green-400';
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
            Market Analysis
          </h1>
          <p className="text-gray-400">Comprehensive market insights and technical analysis</p>
        </motion.div>

        {/* Market Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-lg rounded-xl p-4 border border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Market Cap</p>
                <p className="text-white text-xl font-bold">${marketOverview.totalMarketCap}T</p>
              </div>
              <PieChart className="h-8 w-8 text-purple-400" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-900/50 to-yellow-900/50 backdrop-blur-lg rounded-xl p-4 border border-orange-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">BTC Dominance</p>
                <p className="text-white text-xl font-bold">{marketOverview.btcDominance}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-400" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 backdrop-blur-lg rounded-xl p-4 border border-green-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Fear & Greed</p>
                <p className="text-white text-xl font-bold">{marketOverview.fearGreedIndex}</p>
              </div>
              <Activity className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 backdrop-blur-lg rounded-xl p-4 border border-blue-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Coins</p>
                <p className="text-white text-xl font-bold">{marketOverview.activeCoins}</p>
              </div>
              <Target className="h-8 w-8 text-blue-400" />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Analysis Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Timeframe & Indicator Selection */}
            <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Eye className="h-5 w-5 mr-2 text-purple-400" />
                Analysis Settings
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Timeframe</label>
                  <div className="grid grid-cols-4 gap-2">
                    {timeframes.map(tf => (
                      <button
                        key={tf}
                        onClick={() => setSelectedTimeframe(tf)}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          selectedTimeframe === tf
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Indicator</label>
                  <select
                    value={selectedIndicator}
                    onChange={(e) => setSelectedIndicator(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                  >
                    {indicators.map(indicator => (
                      <option key={indicator} value={indicator}>{indicator}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Top Movers */}
            <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-purple-400" />
                Top Movers
              </h2>
              
              <div className="space-y-3">
                {topMovers.map((mover, index) => (
                  <div key={index} className="bg-gray-800/30 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-white">{mover.symbol}</span>
                      <div className={`flex items-center text-sm ${
                        mover.change >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {mover.change >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                        {mover.change >= 0 ? '+' : ''}{mover.change}%
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">${mover.price}</span>
                      <span className="text-gray-400">Vol: {mover.volume}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Correlation Matrix */}
            <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <LineChart className="h-5 w-5 mr-2 text-purple-400" />
                Correlation Matrix
              </h2>
              
              <div className="space-y-3">
                {correlationMatrix.map((corr, index) => (
                  <div key={index} className="bg-gray-800/30 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">{corr.pair}</span>
                      <div className="text-right">
                        <div className={`font-bold ${getCorrelationColor(corr.correlation)}`}>
                          {corr.correlation.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-400">{corr.strength}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Technical Analysis & Sentiment */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Technical Analysis */}
            <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-purple-400" />
                Technical Analysis
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 text-gray-300">Symbol</th>
                      <th className="text-left py-2 text-gray-300">RSI</th>
                      <th className="text-left py-2 text-gray-300">MACD</th>
                      <th className="text-left py-2 text-gray-300">SMA 20/50</th>
                      <th className="text-left py-2 text-gray-300">Signal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {technicalAnalysis.map((analysis, index) => (
                      <tr key={index} className="border-b border-gray-800">
                        <td className="py-3 text-white font-medium">{analysis.symbol}</td>
                        <td className="py-3">
                          <span className={`${
                            analysis.rsi > 70 ? 'text-red-400' : analysis.rsi < 30 ? 'text-green-400' : 'text-gray-300'
                          }`}>
                            {analysis.rsi}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={getSentimentColor(analysis.macd)}>
                            {analysis.macd}
                          </span>
                        </td>
                        <td className="py-3 text-gray-300">
                          {analysis.sma20.toLocaleString()}/{analysis.sma50.toLocaleString()}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getSignalColor(analysis.signal)}`}>
                            {analysis.signal}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Market Sentiment */}
            <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-purple-400" />
                Market Sentiment
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {marketSentiment.map((sentiment, index) => (
                  <div key={index} className="bg-gray-800/30 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-white">{sentiment.category}</h3>
                      <span className={getSentimentColor(sentiment.sentiment)}>
                        {sentiment.sentiment}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 mr-3">
                        <div className="bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              sentiment.score >= 70 ? 'bg-green-500' :
                              sentiment.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${sentiment.score}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">{sentiment.score}</div>
                        <div className={`text-xs ${
                          sentiment.change >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {sentiment.change >= 0 ? '+' : ''}{sentiment.change}%
                        </div>
                      </div>
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

export default MarketAnalysis;