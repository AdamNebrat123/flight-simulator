import { useCallback, useEffect, useRef } from "react";
import { useWebSocketConnection } from "./useWebSocketConnection";
import type { MessageWrapper } from "../Messages/AllTypes";

type EventHandler = (data: any) => void;


export function useWebSocketEvents() {
  const reconnectDelay = 3000;
  const { isConnected, sendRaw, setOnMessage } = useWebSocketConnection(reconnectDelay);
  const eventHandlers = useRef<Record<string, EventHandler[]>>({});

  const send = useCallback((type: string, data: any) => {
    const wrapper: MessageWrapper = { type, data};
    sendRaw(JSON.stringify(wrapper));
  }, [sendRaw]);

  const on = useCallback((type: string, handler: EventHandler) => {
    if (!eventHandlers.current[type]) {
      eventHandlers.current[type] = [];
    }
    eventHandlers.current[type].push(handler);

    return () => {
      eventHandlers.current[type] = eventHandlers.current[type].filter(h => h !== handler);
    };
  }, []);

  // Use raw hook’s setOnMessage to handle dispatching messages to handlers
  useEffect(() => {
    setOnMessage(rawMessage => {
      try {
        console.log("recieved: ", rawMessage)
        const wrapper: MessageWrapper = JSON.parse(rawMessage);
        const handlers = eventHandlers.current[wrapper.type] || [];
        handlers.forEach(handler => handler(wrapper.data));
      } catch (err) {
        console.error("Invalid message:", rawMessage);
      }
    });
  }, [setOnMessage]);

  return { isConnected, send, on };
}