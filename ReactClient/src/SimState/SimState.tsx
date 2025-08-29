// SimState.tsx
import { createContext } from "react";
import type { ScenarioPlayer } from "../ScenarioPlayControlPanel/ScenarioPlayer";

export interface SimStateType {
  scenarioPlayer: ScenarioPlayer
  // more things, soon
}

export const SimState = createContext<{
  simState: SimStateType;
  setSimState: React.Dispatch<React.SetStateAction<SimStateType>>;
} | null>(null);