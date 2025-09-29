import { useState, useEffect, useRef } from 'react';

const useWebSocket = (url = null) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    // Skip WebSocket connection for now
    if (!url) {
      console.log('WebSocket URL not provided, skipping connection');
      return;
    }
    
    try {
      const ws = new WebSocket(url);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
        
        // Authenticate if token exists
        const token = localStorage.getItem('authToken');
        if (token) {
          ws.send(JSON.stringify({
            type: 'auth',
            token
          }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          setLastMessage(message);
          
          // Handle different message types
          switch (message.type) {
            case 'auth_success':
              console.log('WebSocket authenticated');
              // Subscribe to relevant channels
              ws.send(JSON.stringify({
                type: 'subscribe',
                channel: 'market_data'
              }));
              ws.send(JSON.stringify({
                type: 'subscribe',
                channel: 'signals'
              }));
              break;
            case 'auth_error':
              console.error('WebSocket authentication failed');
              break;
            default:
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setSocket(null);
        
        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect... (${reconnectAttempts.current}/${maxReconnectAttempts})`);
            connect();
          }, delay);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError(error);
      };

      setSocket(ws);
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setError(error);
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (socket) {
      socket.close();
    }
    
    setSocket(null);
    setIsConnected(false);
  };

  const sendMessage = (message) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected');
    }
  };

  const subscribe = (channel, symbol = null) => {
    sendMessage({
      type: 'subscribe',
      channel,
      symbol
    });
  };

  const unsubscribe = (channel, symbol = null) => {
    sendMessage({
      type: 'unsubscribe',
      channel,
      symbol
    });
  };

  useEffect(() => {
    // Only connect if URL is provided
    if (url) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [url]);

  return {
    socket,
    isConnected,
    lastMessage,
    error,
    sendMessage,
    subscribe,
    unsubscribe,
    connect,
    disconnect
  };
};

export default useWebSocket;