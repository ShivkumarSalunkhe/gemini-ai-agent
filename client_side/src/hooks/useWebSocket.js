import { useState, useEffect, useCallback } from 'react';

export const useWebSocket = (url) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = (event) => {
      setError('WebSocket error occurred');
      console.error('WebSocket error:', event);
      setIsLoading(false);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, { ...data, type: 'response' }]);
      setIsLoading(false);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [url]);

  const sendMessage = useCallback(
    (content) => {
      if (socket && isConnected) {
        const message = { type: 'query', content };
        socket.send(JSON.stringify(message));
        setMessages((prev) => [...prev, message]);
        setIsLoading(true);
      }
    },
    [socket, isConnected]
  );

  return {
    sendMessage,
    messages,
    isConnected,
    error,
    isLoading
  };
}; 