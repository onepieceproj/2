import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Clock, Target, Zap, Star } from 'lucide-react';

const SignalCard = ({ signal }) => {
  const navigate = useNavigate();
  const isPositive = signal.type === 'BUY';
  const confidenceColor = signal.confidence >= 80 ? 'text-green-400' : signal.confidence >= 60 ? 'text-yellow-400' : 'text-red-400';
  const signalTypeColor = isPositive ? 'text-green-400' : 'text-red-400';
  const borderColor = isPositive ? 'border-green-500/30' : 'border-red-500/30';
  const bgGradient = isPositive ? 'from-green-900/20 to-emerald-900/20' : 'from-red-900/20 to-pink-900/20';

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatPrice = (price) => {
    return typeof price === 'number' ? price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }) : price;
  };

  return (
    <motion.div
      className={`relative p-6 rounded-2xl bg-gradient-to-br ${bgGradient} backdrop-blur-sm border ${borderColor} overflow-hidden group hover:shadow-2xl transition-all duration-300`}
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.3 }}
    >
      {/* Animated Background Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className={`absolute inset-0 bg-gradient-to-r ${isPositive ? 'from-green-600/10 to-transparent' : 'from-red-600/10 to-transparent'}`}></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <Star className="w-4 h-4 text-purple-400" />
        </motion.div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isPositive ? 'bg-green-600/20' : 'bg-red-600/20'} backdrop-blur-sm`}>
              {isPositive ? (
                <TrendingUp className="w-5 h-5 text-green-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">{signal.pair}</h3>
              <p className={`text-sm font-semibold ${signalTypeColor}`}>{signal.type} SIGNAL</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center space-x-1 mb-1">
              <Target className={`w-4 h-4 ${confidenceColor}`} />
              <span className={`text-sm font-bold ${confidenceColor}`}>
                {signal.confidence}%
              </span>
            </div>
            <p className="text-xs text-gray-400">Confidence</p>
          </div>
        </div>

        {/* Price Information */}
        <div className="mb-4 p-4 rounded-xl bg-black/20 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Target Price</span>
            <span className="text-white font-bold text-lg">${formatPrice(signal.price)}</span>
          </div>
          
          {signal.indicators && (
            <div className="space-y-2">
              {signal.indicators.rsi && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">RSI</span>
                  <span className={`font-semibold ${
                    signal.indicators.rsi > 70 ? 'text-red-400' : 
                    signal.indicators.rsi < 30 ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {signal.indicators.rsi.toFixed(1)}
                  </span>
                </div>
              )}
              
              {signal.indicators.macd && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">MACD</span>
                  <span className={`font-semibold ${
                    signal.indicators.macd > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {signal.indicators.macd > 0 ? '+' : ''}{signal.indicators.macd.toFixed(4)}
                  </span>
                </div>
              )}
              
              {signal.indicators.volume && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Volume</span>
                  <span className="text-purple-400 font-semibold">
                    {signal.indicators.volume.toFixed(2)}M
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Timeframe and Timestamp */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300 font-medium">{signal.timeframe}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-400">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{formatTime(signal.timestamp)}</span>
          </div>
        </div>

        {/* Action Button */}
        <motion.button
          className={`w-full mt-4 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
            isPositive
              ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 hover:from-green-600/30 hover:to-emerald-600/30 text-green-400 border border-green-500/30'
              : 'bg-gradient-to-r from-red-600/20 to-pink-600/20 hover:from-red-600/30 hover:to-pink-600/30 text-red-400 border border-red-500/30'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            // Navigate to spot trading with pre-filled data
            navigate(`/spot-trading?pair=${signal.pair}&type=${signal.type}&price=${signal.price}`);
          }}
        >
          Execute Trade
        </motion.button>
      </div>
    </motion.div>
  );
};

export default SignalCard;