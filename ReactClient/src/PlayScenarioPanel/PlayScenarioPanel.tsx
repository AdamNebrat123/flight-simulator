import { useWebSocket } from "../WebSocket/WebSocketProvider";
import { useContext, useState } from "react";
import "./PlayScenarioPanel.css";
import { ScenarioPlayer } from "../ScenarioPlayControlPanel/ScenarioPlayer";
import { SimState } from "../SimState/SimState";

interface Props {
  onPlay: () => void;
  onClose: () => void;
}

export default function PlayScenarioPanel({ onPlay, onClose }: Props) {
  const { send } = useWebSocket();
  const simStateContext  = useContext(SimState);
  const scenarioPlayer = simStateContext?.simState.scenarioPlayer!;

  const handleSelect = (name: string) => {
    scenarioPlayer.selectScenario(name);
    simStateContext?.setSimState({...simStateContext.simState})
  };

  return (
    <div className="playScenario-panel">
      <h3>Play Scenario</h3>

      {scenarioPlayer.scenarios.length === 0 && <p>No scenarios ready.</p>}

      <ul className="scenario-list">
        {scenarioPlayer.scenarios.map((name) => (
          <li
            key={name}
            className={`scenario-item ${scenarioPlayer.selectedScenario === name ? "selected" : ""}`}
            onClick={() => handleSelect(name)}
          >
            {name}
          </li>
        ))}
      </ul>

      <button onClick={onPlay} disabled={!scenarioPlayer.selectedScenario}>
        Play
      </button>
      <button onClick={onClose} style={{ marginLeft: 8 }}>
        Close
      </button>
    </div>
  );
}
