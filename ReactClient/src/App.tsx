import { useRef, useState } from 'react';
import * as Cesium from 'cesium';
import CesiumMap from './CesiumMap';
import TopLeftButtons from './TrajectoryScenario/TopLeftButtons';
import CreateTrajectoryPanel from './TrajectoryScenario/CreateTrajectoryPanel';
import type { PlanesTrajectoryPointsEvent } from './Messages/AllTypes';
import { useWebSocket } from './webSocket/Websocket';

export default function App() {
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const { isConnected, send, on } = useWebSocket("ws://localhost:5000");

  const handleOpenPanel = () => {
    setShowPanel(true);
  };

  const handleSave = (data: PlanesTrajectoryPointsEvent) => {
    console.log('Saved trajectory scenario', data);
    setShowPanel(false);
    send("PlanesTrajectoryPointsEvent", data)
  };

  const handleCancel = (data: PlanesTrajectoryPointsEvent) => {
    console.log('canceled trajectory scenario', data);
    setShowPanel(false);
  };

  return (
    <>
      
      <CesiumMap viewerRef={viewerRef} />
      {!showPanel && <TopLeftButtons onCreateClick={handleOpenPanel} />}
      {showPanel && (
        <CreateTrajectoryPanel onSave={handleSave} onCancel={handleCancel} viewerRef={viewerRef}/>
      )}
    </>
  );
}