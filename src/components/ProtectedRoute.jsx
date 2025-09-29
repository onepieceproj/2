import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useTrading } from '../context/TradingContext';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useTrading();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token && !isLoading) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
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

  if (!localStorage.getItem('authToken')) {
    return null;
  }

  return children;
};

export default ProtectedRoute;