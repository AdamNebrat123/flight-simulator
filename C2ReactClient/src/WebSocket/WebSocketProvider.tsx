import { createContext, useContext, type ReactNode } from "react";
import { useWebSocketEvents } from "./useWebSocketEvents";

interface WebSocketContextValue {
  isConnected: boolean;
  send: (type: string, data: any) => void;
  on: (type: string, handler: (data: any) => void) => () => void;
}

interface WebSocketProviderProps {
  children: ReactNode;
  clientMode: string;
}

const WebSocketContext = createContext<WebSocketContextValue | undefined>(undefined);

export const WebSocketProvider = ({ children, clientMode }: WebSocketProviderProps) => {
  const ws = useWebSocketEvents({ clientMode });

  return (
    <WebSocketContext.Provider value={ws}>
      {children}
    </WebSocketContext.Provider>
  );
};

export function useWebSocket(): WebSocketContextValue {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within WebSocketProvider");
  }
  return context;
}
