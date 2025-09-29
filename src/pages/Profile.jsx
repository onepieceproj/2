import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Camera, 
  Edit3, 
  Save, 
  X,
  Award,
  TrendingUp,
  Target
} from 'lucide-react';
import EnchantedButton from '../components/EnchantedButton';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    joinDate: '',
    bio: '',
    avatar: null,
    tradingExperience: 'Beginner',
    preferredMarkets: ['Spot'],
    riskTolerance: 'Medium'
  });

  const [stats] = useState({
    totalTrades: 0,
    winRate: 0,
    totalProfit: 0,
    bestTrade: 0,
    tradingDays: 0
  });

  const handleInputChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Save profile to database
    console.log('Saving profile:', profile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form or fetch original data
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Profile</h1>
              <p className="text-gray-400">Manage your account information</p>
            </div>
          </div>

          <EnchantedButton
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center space-x-2"
          >
            {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
            <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
          </EnchantedButton>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-gradient-to-br from-purple-800/30 to-indigo-800/30 backdrop-blur-lg rounded-xl border border-purple-500/20 p-6">
              {/* Avatar Section */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                    {profile.firstName[0]}{profile.lastName[0]}
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 p-2 bg-purple-600 rounded-full text-white hover:bg-purple-700 transition-colors">
                      <Camera className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                <div className="mt-4">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={profile.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full px-3 py-2 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white text-center focus:outline-none focus:border-purple-400"
                        placeholder="First Name"
                      />
                      <input
                        type="text"
                        value={profile.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full px-3 py-2 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white text-center focus:outline-none focus:border-purple-400"
                        placeholder="Last Name"
                      />
                    </div>
                  ) : (
                    <h2 className="text-2xl font-bold text-white">
                      {profile.firstName} {profile.lastName}
                    </h2>
                  )}
                  <p className="text-gray-400 mt-1">Crypto Trader</p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-purple-400" />
                  {isEditing ? (
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="flex-1 px-3 py-2 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
                    />
                  ) : (
                    <span className="text-gray-300">{profile.email}</span>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-purple-400" />
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="flex-1 px-3 py-2 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
                    />
                  ) : (
                    <span className="text-gray-300">{profile.phone}</span>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-purple-400" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="flex-1 px-3 py-2 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
                    />
                  ) : (
                    <span className="text-gray-300">{profile.location}</span>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-purple-400" />
                  <span className="text-gray-300">
                    Joined {new Date(profile.joinDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {isEditing && (
                <div className="mt-6 flex space-x-3">
                  <EnchantedButton
                    onClick={handleSave}
                    className="flex-1 flex items-center justify-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </EnchantedButton>
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Trading Stats */}
            <div className="bg-gradient-to-br from-purple-800/20 to-indigo-800/20 backdrop-blur-lg rounded-xl border border-purple-500/20 p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Trading Statistics</span>
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-purple-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-white">{stats.totalTrades.toLocaleString()}</p>
                  <p className="text-gray-400 text-sm">Total Trades</p>
                </div>
                
                <div className="text-center p-4 bg-green-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-green-400">{stats.winRate}%</p>
                  <p className="text-gray-400 text-sm">Win Rate</p>
                </div>
                
                <div className="text-center p-4 bg-blue-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-blue-400">{formatCurrency(stats.totalProfit)}</p>
                  <p className="text-gray-400 text-sm">Total Profit</p>
                </div>
                
                <div className="text-center p-4 bg-yellow-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-400">{formatCurrency(stats.bestTrade)}</p>
                  <p className="text-gray-400 text-sm">Best Trade</p>
                </div>
                
                <div className="text-center p-4 bg-indigo-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-indigo-400">{stats.tradingDays}</p>
                  <p className="text-gray-400 text-sm">Trading Days</p>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="bg-gradient-to-br from-purple-800/20 to-indigo-800/20 backdrop-blur-lg rounded-xl border border-purple-500/20 p-6">
              <h3 className="text-xl font-bold text-white mb-4">About</h3>
              {isEditing ? (
                <textarea
                  value={profile.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 resize-none"
                  placeholder="Tell us about your trading experience..."
                />
              ) : (
                <p className="text-gray-300 leading-relaxed">{profile.bio}</p>
              )}
            </div>

            {/* Trading Preferences */}
            <div className="bg-gradient-to-br from-purple-800/20 to-indigo-800/20 backdrop-blur-lg rounded-xl border border-purple-500/20 p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Trading Preferences</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    Experience Level
                  </label>
                  {isEditing ? (
                    <select
                      value={profile.tradingExperience}
                      onChange={(e) => handleInputChange('tradingExperience', e.target.value)}
                      className="w-full px-3 py-2 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="1-2 years">1-2 years</option>
                      <option value="3+ years">3+ years</option>
                      <option value="Expert">Expert</option>
                    </select>
                  ) : (
                    <p className="text-white font-medium">{profile.tradingExperience}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    Risk Tolerance
                  </label>
                  {isEditing ? (
                    <select
                      value={profile.riskTolerance}
                      onChange={(e) => handleInputChange('riskTolerance', e.target.value)}
                      className="w-full px-3 py-2 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  ) : (
                    <p className="text-white font-medium">{profile.riskTolerance}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    Preferred Markets
                  </label>
                  <p className="text-white font-medium">
                    {profile.preferredMarkets.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;