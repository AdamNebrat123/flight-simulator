import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "react-toastify";
import type { MessageWrapper } from "../Messages/AllTypes";
import { C2SMessageType } from "../Messages/C2SMessageType";


interface WebSocketConnectionProps {
  clientMode: string;
}

export function useWebSocketConnection({ clientMode }: WebSocketConnectionProps, reconnectDelay = 3000) {
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const messageHandlerRef = useRef<((message: string) => void) | null>(null);

  const connect = useCallback(() => {
    const socket = new WebSocket(`${window.location.origin.replace(/^http/, 'ws')}/ws`);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("Connected")
      toast.success("Connected to server")
      // send initial message with client mode
      const wrapper: MessageWrapper = { type: C2SMessageType.ClientMode, data: { clientMode }, clientMode };
      sendRaw(JSON.stringify(wrapper));
      console.log("sent client mode:", wrapper);

      setIsConnected(true);
      // Reattach the message handler on every reconnect
      if (messageHandlerRef.current) {
        socket.onmessage = (event) => messageHandlerRef.current!(event.data);
      }
    };

    socket.onclose = () => {
      console.log("Disconnected")
      setIsConnected(false);
      setTimeout(connect, reconnectDelay);
    };

    socket.onerror = (error) => console.error("WebSocket error:", error);
  }, [reconnectDelay]);

  const sendRaw = useCallback((message: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(message);
    }
  }, []);

  // Save the handler, attach immediately if socket is ready
  const setOnMessage = useCallback((handler: (message: string) => void) => {
    messageHandlerRef.current = handler;
    if (socketRef.current) {
      socketRef.current.onmessage = (event) => handler(event.data);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => socketRef.current?.close();
  }, [connect]);

  return { isConnected, sendRaw, setOnMessage };
}