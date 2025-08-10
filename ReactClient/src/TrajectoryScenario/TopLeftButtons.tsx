import "./TopLeftButtons.css"

interface Props {
  onCreateClick: () => void;
  onPlayClick: () => void;
}

export default function TopLeftButtons({ onCreateClick, onPlayClick }: Props) {
  return (
    <div className="top-left-buttons">
      <button className="top-button" onClick={onCreateClick}>
        Create trajectory scenario
      </button>
      <button className="top-button" onClick={onPlayClick}>
        Play scenario
      </button>
    </div>
  );
}