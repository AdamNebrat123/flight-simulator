import { useRef, useState, useEffect } from 'react';
import * as Cesium from 'cesium';
import CesiumMap from './CesiumMap';
import TopLeftButtons from './TrajectoryScenario/TopLeftButtons';
import CreateTrajectoryPanel from './TrajectoryScenario/CreateTrajectoryPanel';
import type { PlanesTrajectoryPointsScenario } from './Messages/AllTypes';
import { useWebSocket } from './WebSocket/WebSocketProvider';
import { ToastContainer } from 'react-toastify';

//handler imports
import { PlaneEntityManager } from './Handlers/PlaneEntityManager';
import { MultiPlaneTrajectoryResultHandler } from './Handlers/MultiPlaneTrajectoryResultHandler';


export default function App() {
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const { isConnected, send, on } = useWebSocket()


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

  const handleSave = (data: PlanesTrajectoryPointsScenario) => {
    console.log('Saved trajectory scenario', data);
    setShowPanel(false);
    send("PlanesTrajectoryPointsScenario", data)
  };

  const handleCancel = (data: PlanesTrajectoryPointsScenario) => {
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

      { /*for showing non blocking alerts*/ }
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        newestOnTop 
        closeOnClick 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover
        style={{ zIndex: 999999 }} // Add a very high z-index here
      />
    </>
  );
}