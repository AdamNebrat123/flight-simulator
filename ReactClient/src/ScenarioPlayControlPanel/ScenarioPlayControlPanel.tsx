import "./ScenarioPlayControlPanel.css";

interface Props {
  scenarioName: string;
  isPaused: boolean;
  playSpeed: number;
  onPause: () => void;
  onResume: () => void;
  onChangeSpeed: (speed: number) => void;
  onClose: () => void;
}

export default function ScenarioPlayControlPanel({
  scenarioName,
  isPaused,
  playSpeed,
  onPause,
  onResume,
  onChangeSpeed,
  onClose,
}: Props) {
    return (
    <div className="scenarioPlayControlPanel">
        <h3>Playing: {scenarioName}</h3>

        <button onClick={onPause} disabled={isPaused}>
        Pause
        </button>
        <button onClick={onResume} disabled={!isPaused}>
        Resume
        </button>

        <label htmlFor="playSpeedSelect" style={{ whiteSpace: "nowrap" }}>
        Play Speed:
        </label>
        <select
        id="playSpeedSelect"
        value={playSpeed}
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

        <button onClick={onClose}>
        Close
        </button>
    </div>
    );
}
