import React, { useState } from 'react';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Key, 
  Database,
  Smartphone,
  Mail,
  Volume2,
  Moon,
  Sun,
  Save
} from 'lucide-react';
import EnchantedButton from '../components/EnchantedButton';
import ApiService from '../services/ApiService';

const Settings = () => {
  const [settings, setSettings] = useState({
    // API Settings
    binanceApiKey: '',
    binanceSecretKey: '',
    testnetMode: true,
    
    // Database Settings
    mysqlHost: 'localhost',
    mysqlPort: '3306',
    mysqlDatabase: 'enchanted_trader',
    mysqlUsername: '',
    mysqlPassword: '',
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    soundAlerts: true,
    signalAlerts: true,
    priceAlerts: true,
    
    // Trading Settings
    defaultRiskPercentage: 2,
    maxPositions: 5,
    autoTrade: false,
    
    // UI Settings
    darkMode: true,
    language: 'en',
    currency: 'USD',
    timezone: 'UTC'
  });

  const [activeTab, setActiveTab] = useState('api');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const result = await ApiService.getSettings();
      if (result.success) {
        setSettings(prev => ({ ...prev, ...result.data }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setMessage('');
  };

  const saveSettings = () => {
    setIsSaving(true);
    setMessage('');
    
    ApiService.updateSettings(settings)
      .then(result => {
        if (result.success) {
          setMessage('Settings saved successfully!');
        } else {
          setMessage('Failed to save settings');
        }
      })
      .catch(error => {
        console.error('Error saving settings:', error);
        setMessage('Error saving settings');
      })
      .finally(() => {
        setIsSaving(false);
        setTimeout(() => setMessage(''), 3000);
      });
  };

  const tabs = [
    { id: 'api', label: 'API & Database', icon: Key },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'trading', label: 'Trading', icon: Shield },
    { id: 'ui', label: 'Interface', icon: Palette }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-3 mb-8"
        >
          <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
            <SettingsIcon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-gray-400">Configure your trading platform</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-gradient-to-br from-purple-800/30 to-indigo-800/30 backdrop-blur-lg rounded-xl border border-purple-500/20 p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-purple-600/30 text-purple-300 shadow-lg'
                          : 'text-gray-400 hover:text-white hover:bg-purple-600/10'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <div className="bg-gradient-to-br from-purple-800/20 to-indigo-800/20 backdrop-blur-lg rounded-xl border border-purple-500/20 p-6">
              {/* API & Database Settings */}
              {activeTab === 'api' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-white mb-4">API & Database Configuration</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-purple-300 flex items-center space-x-2">
                        <Key className="h-5 w-5" />
                        <span>Binance API</span>
                      </h3>
                      
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          API Key
                        </label>
                        <input
                          type="password"
                          value={settings.binanceApiKey}
                          onChange={(e) => handleSettingChange('binanceApiKey', e.target.value)}
                          className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
                          placeholder="Enter your Binance API key"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Secret Key
                        </label>
                        <input
                          type="password"
                          value={settings.binanceSecretKey}
                          onChange={(e) => handleSettingChange('binanceSecretKey', e.target.value)}
                          className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
                          placeholder="Enter your Binance secret key"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="testnet"
                          checked={settings.testnetMode}
                          onChange={(e) => handleSettingChange('testnetMode', e.target.checked)}
                          className="w-4 h-4 text-purple-600 bg-purple-900/30 border-purple-500/30 rounded focus:ring-purple-500 focus:ring-2"
                        />
                        <label htmlFor="testnet" className="text-gray-300">
                          Use Testnet Mode
                        </label>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-purple-300 flex items-center space-x-2">
                        <Database className="h-5 w-5" />
                        <span>MySQL Database</span>
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">
                            Host
                          </label>
                          <input
                            type="text"
                            value={settings.mysqlHost}
                            onChange={(e) => handleSettingChange('mysqlHost', e.target.value)}
                            className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">
                            Port
                          </label>
                          <input
                            type="text"
                            value={settings.mysqlPort}
                            onChange={(e) => handleSettingChange('mysqlPort', e.target.value)}
                            className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Database Name
                        </label>
                        <input
                          type="text"
                          value={settings.mysqlDatabase}
                          onChange={(e) => handleSettingChange('mysqlDatabase', e.target.value)}
                          className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          value={settings.mysqlUsername}
                          onChange={(e) => handleSettingChange('mysqlUsername', e.target.value)}
                          className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Password
                        </label>
                        <input
                          type="password"
                          value={settings.mysqlPassword}
                          onChange={(e) => handleSettingChange('mysqlPassword', e.target.value)}
                          className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-white mb-4">Notification Preferences</h2>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'emailNotifications', label: 'Email Notifications', icon: Mail },
                      { key: 'pushNotifications', label: 'Push Notifications', icon: Smartphone },
                      { key: 'soundAlerts', label: 'Sound Alerts', icon: Volume2 },
                      { key: 'signalAlerts', label: 'Trading Signal Alerts', icon: Bell },
                      { key: 'priceAlerts', label: 'Price Alerts', icon: Bell }
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-purple-900/20 rounded-lg border border-purple-500/20">
                          <div className="flex items-center space-x-3">
                            <Icon className="h-5 w-5 text-purple-400" />
                            <span className="text-white font-medium">{item.label}</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings[item.key]}
                              onChange={(e) => handleSettingChange(item.key, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Trading Settings */}
              {activeTab === 'trading' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-white mb-4">Trading Configuration</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Default Risk Percentage
                      </label>
                      <input
                        type="number"
                        min="0.1"
                        max="10"
                        step="0.1"
                        value={settings.defaultRiskPercentage}
                        onChange={(e) => handleSettingChange('defaultRiskPercentage', parseFloat(e.target.value))}
                        className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Maximum Positions
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={settings.maxPositions}
                        onChange={(e) => handleSettingChange('maxPositions', parseInt(e.target.value))}
                        className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400 transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-purple-900/20 rounded-lg border border-purple-500/20">
                    <input
                      type="checkbox"
                      id="autoTrade"
                      checked={settings.autoTrade}
                      onChange={(e) => handleSettingChange('autoTrade', e.target.checked)}
                      className="w-4 h-4 text-purple-600 bg-purple-900/30 border-purple-500/30 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <label htmlFor="autoTrade" className="text-white font-medium">
                      Enable Auto Trading
                    </label>
                  </div>
                </div>
              )}

              {/* UI Settings */}
              {activeTab === 'ui' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-white mb-4">Interface Settings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Language
                      </label>
                      <select
                        value={settings.language}
                        onChange={(e) => handleSettingChange('language', e.target.value)}
                        className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400 transition-colors"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Currency
                      </label>
                      <select
                        value={settings.currency}
                        onChange={(e) => handleSettingChange('currency', e.target.value)}
                        className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400 transition-colors"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="JPY">JPY</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-purple-900/20 rounded-lg border border-purple-500/20">
                    <div className="flex items-center space-x-2">
                      {settings.darkMode ? <Moon className="h-5 w-5 text-purple-400" /> : <Sun className="h-5 w-5 text-yellow-400" />}
                    </div>
                    <span className="text-white font-medium">Dark Mode</span>
                    <label className="relative inline-flex items-center cursor-pointer ml-auto">
                      <input
                        type="checkbox"
                        checked={settings.darkMode}
                        onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end mt-8">
                {message && (
                  <div className={`mr-4 px-4 py-2 rounded-lg text-sm ${
                    message.includes('success') ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'
                  }`}>
                    {message}
                  </div>
                )}
                <EnchantedButton onClick={saveSettings} className="flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
                </EnchantedButton>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;