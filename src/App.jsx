import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TradingProvider } from './context/TradingContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import TradingDashboard from './components/TradingDashboard';
import SignalGenerator from './components/SignalGenerator';
import Login from './pages/Login';
import Register from './pages/Register';
import Portfolio from './pages/Portfolio';
import Settings from './pages/Settings';
import SpotTrading from './pages/SpotTrading';
import MarginTrading from './pages/MarginTrading';
import TradingHistory from './pages/TradingHistory';
import Backtesting from './pages/Backtesting';
import RiskManagement from './pages/RiskManagement';
import MarketAnalysis from './pages/MarketAnalysis';
import Alerts from './pages/Alerts';
import Profile from './pages/Profile';
import Help from './pages/Help';
import LiveTrading from './pages/LiveTrading';

const App = () => {
  return (
    <TradingProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route path="/*" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white">
                {/* Animated Background */}
                <div className="fixed inset-0 opacity-20 pointer-events-none">
                  <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full filter blur-3xl animate-pulse"></div>
                  <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
                  <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500 rounded-full filter blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
                </div>

                {/* Navigation */}
                <Navbar />

                {/* Main Content */}
                <main className="relative z-10">
                  <Routes>
                    <Route path="/" element={<TradingDashboard />} />
                    <Route path="/signals" element={<SignalGenerator />} />
                    <Route path="/live-trading" element={<LiveTrading />} />
                    <Route path="/portfolio" element={<Portfolio />} />
                    <Route path="/spot-trading" element={<SpotTrading />} />
                    <Route path="/margin-trading" element={<MarginTrading />} />
                    <Route path="/history" element={<TradingHistory />} />
                    <Route path="/backtesting" element={<Backtesting />} />
                    <Route path="/risk" element={<RiskManagement />} />
                    <Route path="/analysis" element={<MarketAnalysis />} />
                    <Route path="/alerts" element={<Alerts />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/help" element={<Help />} />
                  </Routes>
                </main>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </TradingProvider>
  );
};

export default App;