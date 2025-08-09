import { useRef, useState, useEffect } from 'react';
import * as Cesium from 'cesium';
import CesiumMap from './CesiumMap';
import TopLeftButtons from './TrajectoryScenario/TopLeftButtons';
import CreateTrajectoryPanel from './TrajectoryScenario/CreateTrajectoryPanel';
import type { PlanesTrajectoryPointsEvent } from './Messages/AllTypes';
import { useWebSocketEvents } from './WebSocket/useWebSocketEvents';


//handler imports
import { PlaneEntityManager } from './Handlers/PlaneEntityManager';
import { MultiPlaneTrajectoryResultHandler } from './Handlers/MultiPlaneTrajectoryResultHandler';


export default function App() {
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const { isConnected, send, on } = useWebSocketEvents("ws://localhost:5000");


  //needed for MultiPlaneTrajectoryResult
  const planeManagerRef = useRef<PlaneEntityManager | null>(null);

  // when a viewer it initialized, this function is run, everything that need the viewer should be put here
  const handleViewerReady = () => {
    if (viewerRef.current && !planeManagerRef.current) {
      planeManagerRef.current = new PlaneEntityManager(viewerRef.current);
      console.log("PlaneEntityManager created");
    }
  };

  // register to all the events (give a handler for each type of msg.)
useEffect(() => {
  const unsubMultiPlaneTrajectoryResult = on("MultiPlaneTrajectoryResult", (data) => {
    MultiPlaneTrajectoryResultHandler(data, planeManagerRef.current!);
  });

  return () => {
    unsubMultiPlaneTrajectoryResult();
  };
}, []);
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
      
      <CesiumMap viewerRef={viewerRef} onViewerReady={handleViewerReady} />
      {!showPanel && <TopLeftButtons onCreateClick={handleOpenPanel} />}
      {showPanel && (
        <CreateTrajectoryPanel onSave={handleSave} onCancel={handleCancel} viewerRef={viewerRef}/>
      )}
      
    </>
  );
}