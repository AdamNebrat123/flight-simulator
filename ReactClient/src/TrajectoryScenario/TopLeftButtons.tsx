import "./TopLeftButtons.css"
interface Props {
  onCreateClick: () => void;
}
import { useWebSocketConnection } from "../WebSocket/useWebSocketConnection";
export default function TopLeftButtons({ onCreateClick }: Props) {
  const { isConnected, sendRaw, setOnMessage } = useWebSocketConnection("ws://localhost:5000")

  return (
    <div className="top-left-buttons">
      <button className="top-button" onClick={onCreateClick}>
        Create trajectory scenario
      </button>
<button onClick={() => {
const message = {
  type: "PlanesTrajectoryPointsEvent",
  data: {
    planes: [
      {
        planeName: "Plane2",
        geoPoints: [
          {
            longitude: 34.78818939934132,
            latitude: 32.03246875927585,
            altitude: 60
          },
          {
            longitude: 34.78510957937048,
            latitude: 32.03384781176454,
            altitude: 60
          }
        ],
        velocity: 40
      },
      {
        planeName: "Plane3",
        geoPoints: [
          {
            longitude: 34.79457485673966,
            latitude: 32.03532202508667,
            altitude: 400
          },
          {
            longitude: 34.77205926618796,
            latitude: 32.032993137954726,
            altitude: 50
          }
        ],
        velocity: 100
      }
    ]
  }
};

  const jsonString = JSON.stringify(message);
        sendRaw(jsonString);
      }}>sample</button>
      {/* Add more buttons here if needed */}
      {/* <button className="top-button">Other Button</button> */}
    </div>
  );
}