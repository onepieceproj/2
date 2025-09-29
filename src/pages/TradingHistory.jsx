import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  History, 
  Filter, 
  Download, 
  Search, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import EnchantedButton from '../components/EnchantedButton';
import { useTrading } from '../context/TradingContext';
import ApiService from '../services/ApiService';

const TradingHistory = () => {
  const { trades: contextTrades } = useTrading();
  const [trades, setTrades] = useState([
    {
      id: 'TXN001',
      symbol: 'BTCUSDT',
      type: 'BUY',
      side: 'LONG',
      amount: 0.1,
      entryPrice: 42800.00,
      exitPrice: 43250.50,
      pnl: 45.05,
      pnlPercentage: 1.05,
      status: 'CLOSED',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      duration: '30 min'
    },
    {
      id: 'TXN002',
      symbol: 'ETHUSDT',
      type: 'SELL',
      side: 'SHORT',
      amount: 2.5,
      entryPrice: 2680.00,
      exitPrice: 2650.75,
      pnl: 73.13,
      pnlPercentage: 1.09,
      status: 'CLOSED',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      duration: '1h 15min'
    },
    {
      id: 'TXN003',
      symbol: 'BNBUSDT',
      type: 'BUY',
      side: 'LONG',
      amount: 10,
      entryPrice: 310.00,
      exitPrice: null,
      pnl: 58.00,
      pnlPercentage: 1.87,
      status: 'OPEN',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      duration: '30 min'
    }
  ]);

  const [filters, setFilters] = useState({
    symbol: '',
    status: 'ALL',
    type: 'ALL',
    dateFrom: '',
    dateTo: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');

  // Load trades from API
  useEffect(() => {
    const loadTrades = async () => {
      try {
        const result = await ApiService.getTrades(100);
        if (result.success && result.data.length > 0) {
          const formattedTrades = result.data.map(trade => ({
            id: trade.trade_id || `TXN${trade.id}`,
            symbol: trade.pair,
            type: trade.side,
            side: trade.side,
            amount: trade.quantity,
            entryPrice: trade.entry_price,
            exitPrice: trade.exit_price,
            pnl: trade.realized_pnl || 0,
            pnlPercentage: trade.pnl_percentage || 0,
            status: trade.status,
            timestamp: trade.created_at,
            duration: trade.duration_minutes ? `${trade.duration_minutes} min` : 'Active'
          }));
          setTrades(formattedTrades);
        }
      } catch (error) {
        console.error('Error loading trades:', error);
      }
    };

    loadTrades();
  }, [contextTrades]);
  const filteredTrades = trades.filter(trade => {
    const matchesSearch = trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trade.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSymbol = !filters.symbol || trade.symbol === filters.symbol;
    const matchesStatus = filters.status === 'ALL' || trade.status === filters.status;
    const matchesType = filters.type === 'ALL' || trade.type === filters.type;
    
    return matchesSearch && matchesSymbol && matchesStatus && matchesType;
  });

  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  };

  const formatPercentage = (percentage) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportTrades = () => {
    // Export functionality
    console.log('Exporting trades...');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'text-blue-400 bg-blue-900/20';
      case 'CLOSED': return 'text-green-400 bg-green-900/20';
      case 'CANCELLED': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getTypeColor = (type) => {
    return type === 'BUY' ? 'text-green-400' : 'text-red-400';
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
              <History className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Trading History</h1>
              <p className="text-gray-400">View and analyze your trading performance</p>
            </div>
          </div>

          <EnchantedButton
            onClick={exportTrades}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </EnchantedButton>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-800/20 to-indigo-800/20 backdrop-blur-lg rounded-xl border border-purple-500/20 p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search trades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400 transition-colors"
              >
                <option value="ALL">All Status</option>
                <option value="OPEN">Open</option>
                <option value="CLOSED">Closed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400 transition-colors"
              >
                <option value="ALL">All Types</option>
                <option value="BUY">Buy</option>
                <option value="SELL">Sell</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="w-full px-3 py-2 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400 transition-colors"
              />
            </div>

            {/* Date To */}
            <div>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="w-full px-3 py-2 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400 transition-colors"
              />
            </div>
          </div>
        </motion.div>

        {/* Trading Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-800/20 to-indigo-800/20 backdrop-blur-lg rounded-xl border border-purple-500/20 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-purple-500/20">
                  <th className="text-left p-4 text-gray-400 font-medium">Trade ID</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Symbol</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Type</th>
                  <th className="text-right p-4 text-gray-400 font-medium">Amount</th>
                  <th className="text-right p-4 text-gray-400 font-medium">Entry Price</th>
                  <th className="text-right p-4 text-gray-400 font-medium">Exit Price</th>
                  <th className="text-right p-4 text-gray-400 font-medium">P&L</th>
                  <th className="text-center p-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Date</th>
                  <th className="text-center p-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrades.map((trade, index) => (
                  <motion.tr
                    key={trade.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="border-b border-purple-500/10 hover:bg-purple-500/5 transition-colors"
                  >
                    <td className="p-4">
                      <span className="text-white font-mono text-sm">{trade.id}</span>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium">{trade.symbol}</span>
                        <div className={`p-1 rounded ${trade.side === 'LONG' ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
                          {trade.side === 'LONG' ? 
                            <ArrowUpRight className="h-3 w-3 text-green-400" /> : 
                            <ArrowDownRight className="h-3 w-3 text-red-400" />
                          }
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <span className={`font-medium ${getTypeColor(trade.type)}`}>
                        {trade.type}
                      </span>
                    </td>
                    
                    <td className="p-4 text-right text-white">
                      {trade.amount.toLocaleString()}
                    </td>
                    
                    <td className="p-4 text-right text-white">
                      {formatCurrency(trade.entryPrice)}
                    </td>
                    
                    <td className="p-4 text-right text-white">
                      {trade.exitPrice ? formatCurrency(trade.exitPrice) : '-'}
                    </td>
                    
                    <td className="p-4 text-right">
                      {trade.status === 'CLOSED' ? (
                        <div className={`${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          <p className="font-medium">{formatCurrency(trade.pnl)}</p>
                          <p className="text-sm">{formatPercentage(trade.pnlPercentage)}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trade.status)}`}>
                        {trade.status}
                      </span>
                    </td>
                    
                    <td className="p-4">
                      <div className="text-white text-sm">
                        <p>{formatDate(trade.timestamp)}</p>
                        <p className="text-gray-400 text-xs">{trade.duration}</p>
                      </div>
                    </td>
                    
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button className="p-1 text-gray-400 hover:text-white transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-white transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-purple-500/20">
            <div className="text-gray-400 text-sm">
              Showing {filteredTrades.length} of {trades.length} trades
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded hover:bg-purple-600/30 transition-colors">
                Previous
              </button>
              <button className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
                1
              </button>
              <button className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded hover:bg-purple-600/30 transition-colors">
                2
              </button>
              <button className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded hover:bg-purple-600/30 transition-colors">
                Next
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TradingHistory;