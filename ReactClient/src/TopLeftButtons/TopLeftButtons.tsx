import "./TopLeftButtons.css"
interface Props {
  onScenariosClick: () => void;
  onCreateDangerZoneClick: () => void;
}

export default function TopLeftButtons({onScenariosClick, onCreateDangerZoneClick }: Props) {
  return (
    <div className="top-left-buttons">
      <button className="top-button" onClick={onScenariosClick}>
        Scenarios
      </button>
      <button className="top-button" onClick={onCreateDangerZoneClick}>
        Create Danger Zone
        </button>
    </div>
  );
}