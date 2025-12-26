import { useRef, useState, useEffect, useContext } from 'react';
import * as Cesium from 'cesium';
import CesiumMap from './CesiumMap';
import { useWebSocket } from './WebSocket/WebSocketProvider';
import { ToastContainer } from 'react-toastify';
//handler imports
import { ZoneHandler } from './Zones/ZoneHandler';
import { S2CMessageType } from './Messages/S2CMessageType';
import { PlaneEntityManager } from './Scenarios/AirCrafts/PlaneEntityManager';
import { PlaneTailManager } from './Scenarios/AirCrafts/PlaneTailManager';
import { ScenarioPlanesSnapshotHandler } from './Scenarios/Handlers/ScenarioPlanesSnapshotHandler';
import { ZoneEntityManager } from './Zones/ZoneEntityManager';
import { ZoneManager } from './Zones/ZoneManager';
import { JammerHandler } from './Jamming/Handler/JammerHandler';
import { JammersUpdateHandler } from './Jamming/Handler/JammersUpdateHandler';


export default function App() {
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const { on } = useWebSocket();


  //needed for ScenarioPlanesSnapshotHandler
  let planeEntityManager: PlaneEntityManager | null;
  let planeTailManager: PlaneTailManager | null;
  const zoneEntityManagerRef = useRef<ZoneEntityManager | null>(null)
  const ScenarioPlanesSnapshotHandlerRef = useRef<ScenarioPlanesSnapshotHandler | null>(null)
  const zoneHandlerRef =  useRef<ZoneHandler | null>(null);
  const zoneManagerRef = useRef<ZoneManager | null>(null);
  const jammerHandlerRef = useRef<JammerHandler | null>(null);
  const jammersUpdateHandlerRef = useRef<JammersUpdateHandler | null>(null);


  // when a viewer it initialized, this function is run, everything that need the viewer should be put here
  const handleViewerReady = () => {
    if (viewerRef.current) {
      
      planeEntityManager = PlaneEntityManager.getInstance(viewerRef.current);
      planeTailManager = PlaneTailManager.getInstance(viewerRef.current)
      zoneEntityManagerRef.current = ZoneEntityManager.GetInstance(viewerRef.current);
      zoneManagerRef.current = ZoneManager.getInstance();

      ScenarioPlanesSnapshotHandlerRef.current = new ScenarioPlanesSnapshotHandler(
        planeEntityManager,
        planeTailManager, 
        zoneEntityManagerRef.current,
        zoneManagerRef.current
      );
      jammersUpdateHandlerRef.current = JammersUpdateHandler.GetInstance(viewerRef.current);
      zoneHandlerRef.current = ZoneHandler.getInstance(viewerRef.current);
      jammerHandlerRef.current = JammerHandler.getInstance(viewerRef.current);

      // register to all of the events
      registerHandlers();
    }
  };

  // register to all of the events (give a handler for each type of msg.)
  // =================================================================
  // =================================================================
  const registerHandlers = () => {

    // type : ScenarioPlanesSnapshot
    const unsubScenarioPlanesSnapshot = on(S2CMessageType.ScenarioPlanesSnapshot , (data) => {
      ScenarioPlanesSnapshotHandlerRef.current?.HandleScenarioPlanesSnapshot(data);
    });

    // type : JammersUpdate
    const unsubJammersUpdate = on(S2CMessageType.JammersUpdate , (data) => {
      jammersUpdateHandlerRef.current?.HandleJammersUpdate(data);
    });

    //clean up
    return () => {
      unsubScenarioPlanesSnapshot();
      unsubJammersUpdate();
    };
  }
  // =================================================================
  // =================================================================
  
  return (
    <>
      <CesiumMap viewerRef={viewerRef} onViewerReady={handleViewerReady} />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 999999 }}
      />
    </>
  );
}