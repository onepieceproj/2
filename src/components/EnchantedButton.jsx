import React from 'react';
import { motion } from 'framer-motion';

const EnchantedButton = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false, 
  className = '',
  ...props 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: 'bg-gradient-to-r from-purple-600 to-pink-600',
          hover: 'hover:from-purple-500 hover:to-pink-500',
          text: 'text-white',
          border: 'border-purple-500/50',
          shadow: 'shadow-lg shadow-purple-500/25'
        };
      case 'secondary':
        return {
          bg: 'bg-gradient-to-r from-indigo-600/20 to-purple-600/20',
          hover: 'hover:from-indigo-600/30 hover:to-purple-600/30',
          text: 'text-indigo-300',
          border: 'border-indigo-500/30',
          shadow: 'shadow-md shadow-indigo-500/20'
        };
      case 'danger':
        return {
          bg: 'bg-gradient-to-r from-red-600/20 to-pink-600/20',
          hover: 'hover:from-red-600/30 hover:to-pink-600/30',
          text: 'text-red-300',
          border: 'border-red-500/30',
          shadow: 'shadow-md shadow-red-500/20'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-purple-600 to-pink-600',
          hover: 'hover:from-purple-500 hover:to-pink-500',
          text: 'text-white',
          border: 'border-purple-500/50',
          shadow: 'shadow-lg shadow-purple-500/25'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <motion.button
      className={`
        relative px-6 py-3 rounded-xl font-semibold text-sm
        ${styles.bg} ${styles.hover} ${styles.text} ${styles.shadow}
        border ${styles.border}
        backdrop-blur-sm transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        overflow-hidden group
        ${className}
      `}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -2 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {/* Animated Background Overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
      </div>

      {/* Shimmer Effect */}
      <motion.div
        className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ x: '200%' }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />

      {/* Floating Particles */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/60 rounded-full"
            style={{
              left: `${20 + i * 30}%`,
              top: `${30 + i * 20}%`
            }}
            animate={{
              y: [-10, -20, -10],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>

      {/* Button Content */}
      <span className="relative z-10 flex items-center justify-center space-x-2">
        {children}
      </span>
    </motion.button>
  );
};

export default EnchantedButton;