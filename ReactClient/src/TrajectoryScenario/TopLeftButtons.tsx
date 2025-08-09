import "./TopLeftButtons.css"


interface Props {
  onCreateClick: () => void;
}

export default function TopLeftButtons({ onCreateClick }: Props) {

  return (
    <div className="top-left-buttons">
      <button className="top-button" onClick={onCreateClick}>
        Create trajectory scenario
      </button>
    </div>
  );
}