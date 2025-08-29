import { useWebSocket } from "../WebSocket/WebSocketProvider";
import { useContext, useState } from "react";
import "./PlayScenarioPanel.css";
import { SimState } from "../SimState/SimState";
import { ScenarioManager } from "../Managers/ScenarioManager";

interface Props {
  onPlay: (scenarioId: string, scenarioName: string) => void;
  onClose: () => void;
}

export default function PlayScenarioPanel({ onPlay, onClose }: Props) {
  const simStateContext  = useContext(SimState);
  const scenarioPlayer = simStateContext?.simState.scenarioPlayer!;
  const scenarioManager = ScenarioManager.getInstance();
  const scenarios = scenarioManager.getAllScenarios();

  const [selectedScenarioName, setSelectedScenarioName] = useState("");
  const [selectedScenarioId, setSelectedScenarioId] = useState("");

  const handleSelect = (scenarioId: string, scenarioName: string) => {
    scenarioPlayer.selectScenario(scenarioId);
    simStateContext?.setSimState({ ...simStateContext.simState });
    setSelectedScenarioName(scenarioName);
    setSelectedScenarioId(scenarioId);
  };

  return (
    <div className="playScenario-panel">
      <h3>Play Scenario</h3>

      {scenarios.length === 0 && <p>No scenarios ready.</p>}

      <ul className="scenario-list">
        {scenarios.map((scenario) => (
          <li
            key={scenario.scenarioId}
            className={`scenario-item ${scenarioPlayer.selectedScenario === scenario.scenarioId ? "selected" : ""}`}
            onClick={() => handleSelect(scenario.scenarioId, scenario.scenarioName)}
          >
            {scenario.scenarioName}
          </li>
        ))}
      </ul>

      <button onClick={() => onPlay(selectedScenarioId, selectedScenarioName)} disabled={!scenarioPlayer.selectedScenario}>
        Play
      </button>
      <button onClick={onClose} style={{ marginLeft: 8 }}>
        Close
      </button>
    </div>
  );
}
