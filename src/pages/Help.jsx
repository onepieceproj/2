import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, MessageCircle, Mail, Phone, Book, TrendingUp, Shield, Settings } from 'lucide-react';

const Help = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [activeCategory, setActiveCategory] = useState('general');

  const faqCategories = {
    general: {
      title: 'General Questions',
      icon: Book,
      faqs: [
        {
          question: 'How do I get started with the trading platform?',
          answer: 'To get started, first connect your Binance API keys in the Settings page. Then navigate to the Dashboard to view real-time market data and trading signals. Our AI analysis will automatically generate trading recommendations based on technical indicators.'
        },
        {
          question: 'What trading pairs are supported?',
          answer: 'Our platform supports all major cryptocurrency trading pairs available on Binance, including BTC/USDT, ETH/USDT, BNB/USDT, and many more. The system automatically fetches available pairs from your Binance account.'
        },
        {
          question: 'How accurate are the trading signals?',
          answer: 'Our AI-powered signals use advanced technical analysis combining RSI, MACD, Moving Averages, and volume indicators. While no system is 100% accurate, our backtesting shows consistent performance in various market conditions.'
        }
      ]
    },
    trading: {
      title: 'Trading & Signals',
      icon: TrendingUp,
      faqs: [
        {
          question: 'How do spot and margin trading differ?',
          answer: 'Spot trading involves buying and selling cryptocurrencies with your available balance. Margin trading allows you to borrow funds to increase your position size, amplifying both potential profits and losses. Always use proper risk management.'
        },
        {
          question: 'What technical indicators are used?',
          answer: 'Our system analyzes RSI (Relative Strength Index), MACD (Moving Average Convergence Divergence), EMA/SMA (Exponential/Simple Moving Averages), Bollinger Bands, and volume patterns to generate comprehensive trading signals.'
        },
        {
          question: 'Can I customize signal parameters?',
          answer: 'Yes, you can adjust signal sensitivity, timeframes, and risk parameters in the Settings page. Advanced users can fine-tune RSI periods, MACD settings, and moving average lengths to match their trading strategy.'
        }
      ]
    },
    security: {
      title: 'Security & API',
      icon: Shield,
      faqs: [
        {
          question: 'How secure are my API keys?',
          answer: 'Your API keys are encrypted and stored locally in your browser. We recommend using read-only API keys with trading permissions only if you plan to execute trades. Never share your secret keys with anyone.'
        },
        {
          question: 'What API permissions do I need?',
          answer: 'For basic analysis, you only need "Read Info" permissions. For portfolio tracking, add "Read" permissions. For automated trading (if implemented), you would need "Spot & Margin Trading" permissions.'
        },
        {
          question: 'Is my trading data private?',
          answer: 'Yes, all your trading data and analysis results are stored locally in your browser and in your personal MySQL database. We do not have access to your trading information or API keys.'
        }
      ]
    },
    technical: {
      title: 'Technical Support',
      icon: Settings,
      faqs: [
        {
          question: 'The platform is not loading market data',
          answer: 'First, check your internet connection and Binance API status. Ensure your API keys are correctly configured in Settings. If the issue persists, try refreshing the page or clearing your browser cache.'
        },
        {
          question: 'How do I update my API keys?',
          answer: 'Navigate to Settings > API Configuration. Click "Update API Keys" and enter your new Binance API key and secret. The system will automatically validate the connection before saving.'
        },
        {
          question: 'Can I export my trading analysis?',
          answer: 'Yes, you can export your trading signals, portfolio data, and analysis results from the respective pages. Look for the "Export" button in the top-right corner of each section.'
        }
      ]
    }
  };

  const guides = [
    {
      title: 'Getting Started Guide',
      description: 'Complete setup walkthrough for new users',
      duration: '5 min read',
      difficulty: 'Beginner'
    },
    {
      title: 'Advanced Trading Strategies',
      description: 'Learn professional trading techniques and risk management',
      duration: '15 min read',
      difficulty: 'Advanced'
    },
    {
      title: 'API Configuration Tutorial',
      description: 'Step-by-step guide to connect your Binance account',
      duration: '8 min read',
      difficulty: 'Intermediate'
    },
    {
      title: 'Understanding Trading Signals',
      description: 'How to interpret and act on AI-generated signals',
      duration: '12 min read',
      difficulty: 'Intermediate'
    }
  ];

  const filteredFaqs = faqCategories[activeCategory].faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-6">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-purple-400 rounded-full opacity-20"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
            Enchanted Help Center
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Find answers to your questions and master the art of mystical trading
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for help topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 backdrop-blur-sm"
            />
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Category Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <div className="bg-gray-800/30 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Categories</h3>
              <div className="space-y-2">
                {Object.entries(faqCategories).map(([key, category]) => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveCategory(key)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                        activeCategory === key
                          ? 'bg-purple-600/30 text-purple-300 border border-purple-500/30'
                          : 'text-gray-300 hover:bg-gray-700/30 hover:text-white'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="text-sm font-medium">{category.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Contact */}
            <div className="bg-gray-800/30 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 mt-6">
              <h3 className="text-xl font-semibold text-white mb-4">Quick Contact</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg transition-colors">
                  <MessageCircle className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-gray-300">Live Chat</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-gray-300">Email Support</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* FAQ Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800/30 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 mb-8"
            >
              <h2 className="text-2xl font-semibold text-white mb-6">
                {faqCategories[activeCategory].title}
              </h2>
              
              <div className="space-y-4">
                {filteredFaqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-700/50 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      className="w-full flex items-center justify-between p-4 bg-gray-800/20 hover:bg-gray-700/30 transition-colors"
                    >
                      <span className="text-left text-white font-medium">{faq.question}</span>
                      {expandedFaq === index ? (
                        <ChevronUp className="w-5 h-5 text-purple-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-purple-400" />
                      )}
                    </button>
                    
                    {expandedFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="p-4 bg-gray-900/30 border-t border-gray-700/50"
                      >
                        <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Guides Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-800/30 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6"
            >
              <h2 className="text-2xl font-semibold text-white mb-6">Trading Guides</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                {guides.map((guide, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-4 hover:border-purple-500/30 transition-colors cursor-pointer group"
                  >
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
                      {guide.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-3">{guide.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-purple-400">{guide.duration}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        guide.difficulty === 'Beginner' ? 'bg-green-600/20 text-green-400' :
                        guide.difficulty === 'Intermediate' ? 'bg-yellow-600/20 text-yellow-400' :
                        'bg-red-600/20 text-red-400'
                      }`}>
                        {guide.difficulty}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;