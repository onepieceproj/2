import React, { createContext, useContext, useReducer, useEffect } from 'react';
import ApiService from '../services/ApiService';

const TradingContext = createContext();

const initialState = {
  user: null,
  portfolio: null,
  signals: [],
  trades: [],
  marketData: [],
  isLoading: false,
  error: null,
  isAuthenticated: false
};

const tradingReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: !!action.payload };
    
    case 'SET_PORTFOLIO':
      return { ...state, portfolio: action.payload };
    
    case 'SET_SIGNALS':
      return { ...state, signals: action.payload };
    
    case 'ADD_SIGNAL':
      return { ...state, signals: [action.payload, ...state.signals] };
    
    case 'SET_TRADES':
      return { ...state, trades: action.payload };
    
    case 'ADD_TRADE':
      return { ...state, trades: [action.payload, ...state.trades] };
    
    case 'UPDATE_TRADE':
      return {
        ...state,
        trades: state.trades.map(trade =>
          trade.id === action.payload.id ? action.payload : trade
        )
      };
    
    case 'SET_MARKET_DATA':
      return { ...state, marketData: action.payload };
    
    case 'UPDATE_MARKET_DATA':
      return {
        ...state,
        marketData: state.marketData.map(data =>
          data.symbol === action.payload.symbol ? action.payload : data
        )
      };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'LOGOUT':
      return { ...initialState };
    
    default:
      return state;
  }
};

export const TradingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(tradingReducer, initialState);
  const [marketDataInterval, setMarketDataInterval] = useState(null);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          dispatch({ type: 'SET_LOADING', payload: true });
          const profileRes = await ApiService.getProfile();
          if (profileRes.success) {
            dispatch({ type: 'SET_USER', payload: profileRes.data });
            await loadInitialData();
          } else {
            localStorage.removeItem('authToken');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('authToken');
        } finally {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  // Start real-time market data updates
  useEffect(() => {
    if (state.isAuthenticated) {
      const interval = ApiService.startMarketDataUpdates((data) => {
        dispatch({ type: 'SET_MARKET_DATA', payload: data });
      });
      setMarketDataInterval(interval);

      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [state.isAuthenticated]);
  const loadInitialData = async () => {
    try {
      const [portfolioRes, signalsRes, tradesRes, marketRes] = await Promise.all([
        ApiService.getPortfolio(),
        ApiService.getActiveSignals(),
        ApiService.getTrades(10),
        ApiService.getMarketPrices(['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT'])
      ]);

      if (portfolioRes.success) {
        dispatch({ type: 'SET_PORTFOLIO', payload: portfolioRes.data });
      }
      
      if (signalsRes.success) {
        dispatch({ type: 'SET_SIGNALS', payload: signalsRes.data });
      }
      
      if (tradesRes.success) {
        dispatch({ type: 'SET_TRADES', payload: tradesRes.data });
      }

      if (marketRes.success) {
        dispatch({ type: 'SET_MARKET_DATA', payload: marketRes.data });
      }
      
    } catch (error) {
      console.error('Failed to load initial data:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  // Actions
  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const result = await ApiService.login(email, password);
      
      if (result.success) {
        dispatch({ type: 'SET_USER', payload: result.data });
        await loadInitialData();
        return result;
      }
      
      dispatch({ type: 'SET_ERROR', payload: result.message });
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, message: error.message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = () => {
    ApiService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const generateSignal = async (pair, timeframe) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const result = await ApiService.generateAISignal(pair, timeframe);
      
      if (result.success) {
        dispatch({ type: 'ADD_SIGNAL', payload: result.data });
      }
      
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createTrade = async (tradeData) => {
    try {
      const result = await ApiService.createTrade(tradeData);
      
      if (result.success) {
        dispatch({ type: 'ADD_TRADE', payload: result.data });
        // Refresh portfolio after trade
        const portfolioRes = await ApiService.getPortfolio();
        if (portfolioRes.success) {
          dispatch({ type: 'SET_PORTFOLIO', payload: portfolioRes.data });
        }
      }
      
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const refreshData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await loadInitialData();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const result = await ApiService.register(userData);
      
      if (result.success) {
        dispatch({ type: 'SET_USER', payload: result.data });
        await loadInitialData();
      }
      
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, message: error.message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const value = {
    ...state,
    actions: {
      login,
      register,
      logout,
      generateSignal,
      createTrade,
      refreshData,
      clearError: () => dispatch({ type: 'CLEAR_ERROR' })
    }
  };

  return (
    <TradingContext.Provider value={value}>
      {children}
    </TradingContext.Provider>
  );
};

export const useTrading = () => {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
};

export default TradingContext;