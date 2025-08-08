import { useEffect, useRef, useState, useCallback } from "react";
import type { MessageWrapper } from "../Messages/AllTypes";
type EventHandler = (data: any) => void;

export function useWebSocket(url: string, reconnectDelay = 3000) {
  const socketRef = useRef<WebSocket | null>(null);
  const eventHandlers = useRef<Record<string, EventHandler[]>>({});
  const [isConnected, setIsConnected] = useState(false);

  // Send message as MessageWrapper
  const send = useCallback((type: string, data: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      const wrapper: MessageWrapper = { type, data };
      socketRef.current.send(JSON.stringify(wrapper));
    } else {
      console.warn("WebSocket is not connected");
    }
  }, []);

  // Subscribe to a type
  const on = useCallback((type: string, handler: EventHandler) => {
    if (!eventHandlers.current[type]) {
      eventHandlers.current[type] = [];
    }
    eventHandlers.current[type].push(handler);

    return () => {
      eventHandlers.current[type] = eventHandlers.current[type].filter(
        (h) => h !== handler
      );
    };
  }, []);

  // Connect
  const connect = useCallback(() => {
    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      console.log("Connected:", url);
    };

    socket.onmessage = (event) => {
      try {
        const wrapper: MessageWrapper = JSON.parse(event.data);
        const handlers = eventHandlers.current[wrapper.type];
        if (handlers) {
          handlers.forEach((handler) => handler(wrapper.data));
        } else {
          console.warn("No handler for type:", wrapper.type);
        }
      } catch (err) {
        console.error("Failed to parse message:", event.data);
      }
    };

    socket.onclose = () => {
      setIsConnected(false);
      console.log(`Disconnected, retrying in ${reconnectDelay / 1000}s...`);
      setTimeout(connect, reconnectDelay);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }, [url, reconnectDelay]);

  useEffect(() => {
    connect();
    return () => socketRef.current?.close();
  }, [connect]);

  return { isConnected, send, on };
}
