import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

/**
 * Custom hook for WebSocket real-time updates
 * Connects to backend Socket.io server and listens for events
 */
export function useWebSocket(url) {
  // Use provided URL or get from window.ENV
  const defaultUrl = typeof window !== 'undefined' && window.ENV?.API_BASE_URL
    ? window.ENV.API_BASE_URL
    : `${window.location.protocol}//${window.location.host}`;
  
  const socketUrl = url || defaultUrl;
  
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);

  useEffect(() => {
    // Create socket connection
    socketRef.current = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    const socket = socketRef.current;

    // Connection handlers
    socket.on('connect', () => {
      console.log('🔌 WebSocket connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('🔌 WebSocket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('🔌 WebSocket connection error:', error);
      setIsConnected(false);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [url]);

  /**
   * Subscribe to a specific event
   * @param {string} eventName - Event to listen for
   * @param {function} callback - Handler function
   */
  const subscribe = (eventName, callback) => {
    if (!socketRef.current) return;

    socketRef.current.on(eventName, (data) => {
      setLastEvent({ event: eventName, data, timestamp: Date.now() });
      callback(data);
    });

    // Return unsubscribe function
    return () => {
      socketRef.current?.off(eventName, callback);
    };
  };

  /**
   * Emit an event to the server
   * @param {string} eventName - Event name
   * @param {any} data - Data to send
   */
  const emit = (eventName, data) => {
    if (!socketRef.current) return;
    socketRef.current.emit(eventName, data);
  };

  return {
    socket: socketRef.current,
    isConnected,
    lastEvent,
    subscribe,
    emit
  };
}

/**
 * Hook for subscribing to specific AICOO events
 */
export function useAICOOEvents(onOrder, onDelivery, onEvent) {
  const { subscribe, isConnected } = useWebSocket();

  useEffect(() => {
    const unsubscribers = [];

    if (onOrder) {
      const unsub = subscribe('order:created', onOrder);
      if (unsub) unsubscribers.push(unsub);
    }

    if (onDelivery) {
      const unsub = subscribe('delivery:assigned', onDelivery);
      if (unsub) unsubscribers.push(unsub);
    }

    if (onEvent) {
      const unsub = subscribe('event:logged', onEvent);
      if (unsub) unsubscribers.push(unsub);
    }

    // Cleanup all subscriptions
    return () => {
      unsubscribers.forEach(unsub => unsub?.());
    };
  }, [subscribe, onOrder, onDelivery, onEvent]);

  return { isConnected };
}
