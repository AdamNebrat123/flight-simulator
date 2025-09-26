import "./TopLeftButtons.css"
interface Props {
  onScenariosClick: () => void;
  onDangerZonesClick: () => void;
}

export default function TopLeftButtons({onScenariosClick, onDangerZonesClick }: Props) {
  return (
    <div className="top-left-buttons">
      <button className="top-button" onClick={onScenariosClick}>
        Scenarios
      </button>
      <button className="top-button" onClick={onDangerZonesClick}>
        Danger Zones
        </button>
      <button className="top-button" onClick={() => window.open("/real-planes-mode", "_blank")}>
        REAL PLANES MODE
      </button>
    </div>
  );
}