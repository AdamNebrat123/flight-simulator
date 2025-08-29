import { useWebSocket } from "../WebSocket/WebSocketProvider";
import { useState, useEffect, useContext } from "react";
import "./ScenarioPlayControlPanel.css";
import { ScenarioPlayer } from "./ScenarioPlayer";
import { SimState } from "../SimState/SimState";


export default function ScenarioPlayControlPanel() {

  const simStateContext  = useContext(SimState);
  const scenarioPlayer = simStateContext?.simState.scenarioPlayer!;
  
  const onPause = () => {
    scenarioPlayer.pause();
    simStateContext?.setSimState({...simStateContext.simState})
  };

  const onResume = () => {
    scenarioPlayer.resume();
    simStateContext?.setSimState({...simStateContext.simState})
  };

  const onChangeSpeed = (speed: number) => {
    scenarioPlayer.changeSpeed(speed);
    simStateContext?.setSimState({...simStateContext.simState})
  };

  const onClose = () => {
    scenarioPlayer.closeScenario();
    simStateContext?.setSimState({...simStateContext.simState})
  }

  return (
    <div className="scenarioPlayControlPanel">
      <h3>Playing: {scenarioPlayer.playingScenarioName}</h3>

      <button onClick={onPause} disabled={scenarioPlayer.isPaused}>
        Pause
      </button>
      <button onClick={onResume} disabled={!scenarioPlayer.isPaused}>
        Resume
      </button>

      <label htmlFor="playSpeedSelect" style={{ whiteSpace: "nowrap" }}>
        Play Speed:
      </label>
      <select
        id="playSpeedSelect"
        value={scenarioPlayer.playSpeed}
        onChange={(e) => onChangeSpeed(Number(e.target.value))}
      >
        <option value={0.1}>0.1x</option>
        <option value={0.2}>0.2x</option>
        <option value={0.5}>0.5x</option>
        <option value={1}>1x</option>
        <option value={2}>2x</option>
        <option value={5}>5x</option>
        <option value={10}>10x</option>
      </select>

      <button onClick={onClose}>Close</button>
    </div>
  );
}
