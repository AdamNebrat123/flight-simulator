import "./PlayScenarioPanel.css";

interface Props {
  onPlay: () => void;
  onClose: () => void;
  scenarios: string[];
  selectedScenario: string | null;
  onSelect: (scenario: string) => void;
}

export default function PlayScenarioPanel({onPlay, onClose, scenarios, selectedScenario, onSelect }: Props) {

  return (
    <div className="playScenario-panel">
        <h3>Play Scenario</h3>

        {scenarios.length === 0 && <p>No scenarios ready.</p>}
        <ul className="scenario-list">
        {scenarios.map((name) => (
            <li
            key={name}
            className={`scenario-item ${selectedScenario === name ? "selected" : ""}`}
            onClick={() => onSelect(name)}
            >
            {name}
            </li>
        ))}
        </ul>

        <button onClick={onPlay} disabled={!selectedScenario}>
            Play
        </button>
        <button onClick={onClose} style={{ marginLeft: 8 }}>
            Close
        </button>
    </div>
  );
}