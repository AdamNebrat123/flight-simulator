import {type ReactNode, useState } from "react";
import { SimState, type SimStateType } from "./SimState";
import { useWebSocket } from "../WebSocket/WebSocketProvider";
import { ScenarioPlayer } from "../ScenarioPlayControlPanel/ScenarioPlayer";

interface Props {
  children: ReactNode;
}

export function SimStateProvider({ children }: Props) {
    const {send} = useWebSocket(); 
    const [simState, setSimState] = useState<SimStateType>({
        scenarioPlayer: new ScenarioPlayer(send)
    });

  return (
    <SimState.Provider value={{ simState, setSimState }}>
      {children}
    </SimState.Provider>
  );
}