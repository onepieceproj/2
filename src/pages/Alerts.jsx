import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Plus, Trash2, CreditCard as Edit3, TrendingUp, TrendingDown, Target, Zap, Clock, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle } from 'lucide-react';
import ApiService from '../services/ApiService';

const Alerts = () => {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      symbol: 'BTCUSDT',
      type: 'price',
      condition: 'above',
      value: 45000,
      status: 'active',
      createdAt: new Date(Date.now() - 86400000).toLocaleString(),
      triggered: false
    },
    {
      id: 2,
      symbol: 'ETHUSDT',
      type: 'rsi',
      condition: 'below',
      value: 30,
      status: 'active',
      createdAt: new Date(Date.now() - 172800000).toLocaleString(),
      triggered: false
    }
  ]);

  const [newAlert, setNewAlert] = useState({
    symbol: 'BTCUSDT',
    type: 'price',
    condition: 'above',
    value: ''
  });

  const [isCreating, setIsCreating] = useState(false);
  const [selectedSymbols] = useState(['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT', 'DOTUSDT']);
  const [alertHistory, setAlertHistory] = useState([
    {
      id: 1,
      symbol: 'BTCUSDT',
      message: 'Price reached $43,250 (above $43,000)',
      triggeredAt: '2 hours ago'
    },
    {
      id: 2,
      symbol: 'ETHUSDT',
      message: 'RSI dropped to 28.5 (below 30)',
      triggeredAt: '4 hours ago'
    }
  ]);

  const alertTypes = [
    { value: 'price', label: 'Price Alert', icon: Target },
    { value: 'volume', label: 'Volume Alert', icon: TrendingUp },
    { value: 'rsi', label: 'RSI Alert', icon: Zap },
    { value: 'macd', label: 'MACD Alert', icon: TrendingDown }
  ];

  const conditions = {
    price: ['above', 'below'],
    volume: ['above', 'below'],
    rsi: ['above', 'below'],
    macd: ['bullish_cross', 'bearish_cross']
  };

  // Load alerts from API
  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const result = await ApiService.getAlerts();
        if (result.success) {
          setAlerts(result.data);
        }
      } catch (error) {
        console.error('Error loading alerts:', error);
      }
    };

    loadAlerts();
  }, []);
  const createAlert = async () => {
    if (!newAlert.value) return;
    
    try {
      const alertData = {
        symbol: newAlert.symbol,
        alert_type: `${newAlert.type.toUpperCase()}_${newAlert.condition.toUpperCase()}`,
        target_value: parseFloat(newAlert.value)
      };
      
      // Call API to create alert
      const result = await ApiService.createAlert(alertData);
      
      if (result.success) {
        const alert = {
          id: alerts.length + 1,
          ...newAlert,
          value: parseFloat(newAlert.value),
          status: 'active',
          createdAt: new Date().toLocaleString(),
          triggered: false
        };
        
        setAlerts([...alerts, alert]);
        setNewAlert({ symbol: 'BTCUSDT', type: 'price', condition: 'above', value: '' });
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  };

  const deleteAlert = async (id) => {
    try {
      const result = await ApiService.deleteAlert(id);
      if (result.success) {
        setAlerts(alerts.filter(alert => alert.id !== id));
      }
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  const toggleAlertStatus = (id) => {
    setAlerts(alerts.map(alert => 
      alert.id === id 
        ? { ...alert, status: alert.status === 'active' ? 'paused' : 'active' }
        : alert
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'paused': return 'text-yellow-400';
      case 'triggered': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'paused': return <Clock className="h-4 w-4" />;
      case 'triggered': return <Bell className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getAlertTypeIcon = (type) => {
    const alertType = alertTypes.find(at => at.value === type);
    const IconComponent = alertType ? alertType.icon : Target;
    return IconComponent;
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-2">
                Price Alerts
              </h1>
              <p className="text-gray-400">Set up custom alerts for price movements and technical indicators</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCreating(true)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 shadow-lg"
            >
              <Plus className="h-5 w-5" />
              <span>Create Alert</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Alert Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 backdrop-blur-lg rounded-xl p-4 border border-green-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Alerts</p>
                <p className="text-white text-2xl font-bold">{alerts.filter(a => a.status === 'active').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 backdrop-blur-lg rounded-xl p-4 border border-blue-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Triggered Today</p>
                <p className="text-white text-2xl font-bold">{alertHistory.length}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 backdrop-blur-lg rounded-xl p-4 border border-yellow-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Paused</p>
                <p className="text-white text-2xl font-bold">{alerts.filter(a => a.status === 'paused').length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-lg rounded-xl p-4 border border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Alerts</p>
                <p className="text-white text-2xl font-bold">{alerts.length}</p>
              </div>
              <Target className="h-8 w-8 text-purple-400" />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Alert Form */}
          {isCreating && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Plus className="h-5 w-5 mr-2 text-purple-400" />
                  Create New Alert
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Symbol</label>
                    <select
                      value={newAlert.symbol}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, symbol: e.target.value }))}
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                    >
                      {selectedSymbols.map(symbol => (
                        <option key={symbol} value={symbol}>{symbol}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Alert Type</label>
                    <select
                      value={newAlert.type}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, type: e.target.value, condition: conditions[e.target.value][0] }))}
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                    >
                      {alertTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Condition</label>
                    <select
                      value={newAlert.condition}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, condition: e.target.value }))}
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                    >
                      {conditions[newAlert.type]?.map(condition => (
                        <option key={condition} value={condition}>
                          {condition.replace('_', ' ').toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Value</label>
                    <input
                      type="number"
                      value={newAlert.value}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, value: e.target.value }))}
                      placeholder="Enter target value"
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={createAlert}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white py-2 rounded-lg font-medium transition-all"
                    >
                      Create Alert
                    </motion.button>
                    <button
                      onClick={() => setIsCreating(false)}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Active Alerts */}
          <motion.div
            initial={{ opacity: 0, x: isCreating ? 0 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={isCreating ? "lg:col-span-2" : "lg:col-span-2"}
          >
            <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Bell className="h-5 w-5 mr-2 text-purple-400" />
                Active Alerts
              </h2>
              
              <div className="space-y-4">
                {alerts.map((alert) => {
                  const IconComponent = getAlertTypeIcon(alert.type);
                  return (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-800/30 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3">
                          <IconComponent className="h-5 w-5 text-purple-400" />
                          <div>
                            <h3 className="font-medium text-white">{alert.symbol}</h3>
                            <p className="text-sm text-gray-400">
                              {alert.type.toUpperCase()} {alert.condition} {alert.value}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`flex items-center space-x-1 ${getStatusColor(alert.status)}`}>
                            {getStatusIcon(alert.status)}
                            <span className="text-sm font-medium">{alert.status}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Created: {alert.createdAt}</span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => toggleAlertStatus(alert.id)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors"
                          >
                            {alert.status === 'active' ? 'Pause' : 'Resume'}
                          </button>
                          <button
                            onClick={() => deleteAlert(alert.id)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-medium transition-colors flex items-center space-x-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                
                {alerts.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    No alerts created yet. Click "Create Alert" to get started.
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Alert History */}
          {!isCreating && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-purple-400" />
                  Recent Triggers
                </h2>
                
                <div className="space-y-3">
                  {alertHistory.map((history) => (
                    <motion.div
                      key={history.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-800/30 rounded-lg p-3"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium mb-1">{history.symbol}</p>
                          <p className="text-gray-300 text-xs mb-2">{history.message}</p>
                          <p className="text-gray-400 text-xs">{history.triggeredAt}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Alerts;