import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Activity, Zap, Star, Sparkles } from 'lucide-react';
import SignalCard from './SignalCard';
import EnchantedButton from './EnchantedButton';
import { useTrading } from '../context/TradingContext';

const TradingDashboard = () => {
  const { portfolio, signals, marketData, isLoading, actions } = useTrading();

  const defaultPortfolio = portfolio || { total_balance: 0, total_pnl: 0, active_positions: 0 };
  const displaySignals = signals || [];
  const displayMarketData = marketData || [];

  // Get current prices from market data
  const btcData = displayMarketData.find(d => d.symbol === 'BTCUSDT');
  const ethData = displayMarketData.find(d => d.symbol === 'ETHUSDT');

  const StatCard = ({ icon: Icon, title, value, change, isPositive }) => (
    <motion.div
      className="relative p-6 rounded-2xl bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-sm border border-purple-500/20 overflow-hidden"
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-purple-600/20 backdrop-blur-sm">
            <Icon className="w-6 h-6 text-purple-400" />
          </div>
          <div className={`flex items-center space-x-1 text-sm ${
            isPositive ? 'text-green-400' : 'text-red-400'
          }`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{change}</span>
          </div>
        </div>
        <h3 className="text-gray-400 text-sm mb-1">{title}</h3>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          className="flex items-center space-x-3"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-8 h-8 text-purple-400" />
          <span className="text-xl text-purple-400">Loading Enchanted Data...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
            Trading Dashboard
          </h1>
          <p className="text-gray-400">Monitor your enchanted trading performance</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <StatCard
            icon={DollarSign}
            title="Portfolio Balance"
            value={`$${defaultPortfolio.total_balance?.toLocaleString() || '10,000'}`}
            change="+2.4%"
            isPositive={true}
          />
          <StatCard
            icon={TrendingUp}
            title="Total P&L"
            value={`$${defaultPortfolio.total_pnl?.toFixed(2) || '245.67'}`}
            change="+12.5%"
            isPositive={(defaultPortfolio.total_pnl || 0) > 0}
          />
          <StatCard
            icon={Activity}
            title="Active Positions"
            value={defaultPortfolio.active_positions || 3}
            change="+1"
            isPositive={true}
          />
          <StatCard
            icon={Zap}
            title="Success Rate"
            value="87.3%"
            change="+5.2%"
            isPositive={true}
          />
        </motion.div>

        {/* Market Overview */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="lg:col-span-2">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-sm border border-purple-500/20">
              <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span>Market Overview</span>
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-black/20">
                  <h3 className="text-gray-400 text-sm mb-1">BTC/USDT</h3>
                  <p className="text-2xl font-bold text-orange-400">
                    ${btcData?.price?.toLocaleString() || '43,250'}
                  </p>
                  <p className={`text-sm ${(btcData?.change_percentage_24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {(btcData?.change_percentage_24h || 0) >= 0 ? '+' : ''}{(btcData?.change_percentage_24h || 2.34).toFixed(2)}%
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-black/20">
                  <h3 className="text-gray-400 text-sm mb-1">ETH/USDT</h3>
                  <p className="text-2xl font-bold text-blue-400">
                    ${ethData?.price?.toLocaleString() || '2,651'}
                  </p>
                  <p className={`text-sm ${(ethData?.change_percentage_24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {(ethData?.change_percentage_24h || 0) >= 0 ? '+' : ''}{(ethData?.change_percentage_24h || -1.68).toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-sm border border-purple-500/20">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <EnchantedButton
                onClick={() => window.location.pathname = '/signals'}
                className="w-full"
              >
                Generate Signals
              </EnchantedButton>
              <EnchantedButton
                variant="secondary"
                onClick={() => window.location.pathname = '/portfolio'}
                className="w-full"
              >
                View Portfolio
              </EnchantedButton>
              <EnchantedButton
                variant="secondary"
                onClick={() => window.location.pathname = '/history'}
                className="w-full"
              >
                Trading History
              </EnchantedButton>
            </div>
          </div>
        </motion.div>

        {/* Recent Signals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <span>Recent Trading Signals</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displaySignals.map((signal, index) => (
              <motion.div
                key={signal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <SignalCard signal={signal} />
              </motion.div>
            ))}
            {displaySignals.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-400">
                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No recent signals available. Generate some signals to get started!</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TradingDashboard;