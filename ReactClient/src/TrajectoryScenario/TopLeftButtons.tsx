import "./TopLeftButtons.css"

interface Props {
  onCreateClick: () => void;
  onPlayClick: () => void;
  onCreateDangerZoneClick: () => void;
}

export default function TopLeftButtons({ onCreateClick, onPlayClick,onCreateDangerZoneClick }: Props) {
  return (
    <div className="top-left-buttons">
      <button className="top-button" onClick={onCreateClick}>
        Create trajectory scenario
      </button>
      <button className="top-button" onClick={onPlayClick}>
        Play scenario
      </button>
      <button className="top-button" onClick={onCreateDangerZoneClick}>
        Create Danger Zone
        </button>
    </div>
  );
}