import { useRef, useState, useEffect, useContext } from 'react';
import * as Cesium from 'cesium';
import CesiumMap from './CesiumMap';
import { useWebSocket } from './WebSocket/WebSocketProvider';
import { ToastContainer } from 'react-toastify';
//handler imports
import { PlaneEntityManager } from './Handlers/PlaneEntityManager';
import { PlaneTailManager } from './Handlers/PlaneTailManager';
import { ScenarioPlanesSnapshotHandler } from './Handlers/ScenarioPlanesSnapshotHandler';
import { DangerZoneEntityManager } from './DangerZonePanel/DangerZoneEntityManager';
import { DangerZoneHandler } from './Handlers/DangerZoneHandler';
import { S2CMessageType } from './Messages/S2CMessageType';
import { handleInitData } from './Handlers/InitDataHandler';
import PanelsAndButtons from './PanelsAndButtons/PanelsAndButtons';
import { ScenarioHandler } from './Handlers/ScenarioHandler';


export default function App() {
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const { on } = useWebSocket();


  //needed for ScenarioPlanesSnapshotHandler
  let planeEntityManager: PlaneEntityManager | null;
  let planeTailManager: PlaneTailManager | null;
  const dangerZoneEntityManagerRef = useRef<DangerZoneEntityManager | null>(null)
  const ScenarioPlanesSnapshotHandlerRef = useRef<ScenarioPlanesSnapshotHandler | null>(null)
  const dangerZoneHandlerRef =  useRef<DangerZoneHandler | null>(null);

  const scenarioHandlerRef = useRef<ScenarioHandler | null>(null);


  // when a viewer it initialized, this function is run, everything that need the viewer should be put here
  const handleViewerReady = () => {
    if (viewerRef.current) {
      
      planeEntityManager = PlaneEntityManager.getInstance(viewerRef.current);
      planeTailManager = PlaneTailManager.getInstance(viewerRef.current)
      dangerZoneEntityManagerRef.current = DangerZoneEntityManager.GetInstance(viewerRef.current);

      ScenarioPlanesSnapshotHandlerRef.current = new ScenarioPlanesSnapshotHandler(
        planeEntityManager,
        planeTailManager, 
        dangerZoneEntityManagerRef.current
      );

      dangerZoneHandlerRef.current = DangerZoneHandler.getInstance(viewerRef.current);
      scenarioHandlerRef.current = ScenarioHandler.getInstance();

      // register to all of the events
      registerHandlers();
    }
  };

  // register to all of the events (give a handler for each type of msg.)
  // =================================================================
  // =================================================================
  const registerHandlers = () => {
    // type : InitData
    const unsubInitData = on(S2CMessageType.InitData,(data) => {
      console.log("handleInitData");
      handleInitData(data, viewerRef.current!);
    });

    // type : ScenarioPlanesSnapshot
    const unsubScenarioPlanesSnapshot = on(S2CMessageType.ScenarioPlanesSnapshot , (data) => {
      ScenarioPlanesSnapshotHandlerRef.current?.HandleScenarioPlanesSnapshot(data);
    });

    // type : AddDanerZone
    const unsubAddDanerZone = on(S2CMessageType.AddDangerZone , (data) => {
      dangerZoneHandlerRef.current?.HandleAddDangerZone(data);
    });

    // type : RemoveDangerZone
    const unsubRemoveDangerZone = on(S2CMessageType.RemoveDangerZone , (data) => {
      dangerZoneHandlerRef.current?.HandleRemoveDangerZone(data);
    });

    // type : EditDangerZone
    const unsubEditDangerZone = on(S2CMessageType.EditDangerZone , (data) => {
      dangerZoneHandlerRef.current?.HandleEditDangerZone(data);
    });

    // type : DangerZoneError
    const unsubDangerZoneError = on(S2CMessageType.DangerZoneError , (data) => {
      dangerZoneHandlerRef.current?.HandleDangerZoneError(data);
    });

    // type : AddScenario
    const unsubAddScenario = on(S2CMessageType.AddScenario, (data) => {
      scenarioHandlerRef.current?.HandleAddScenario(data);
    });

    // type : RemoveScenario
    const unsubRemoveScenario = on(S2CMessageType.RemoveScenario, (data) => {
      scenarioHandlerRef.current?.HandleRemoveScenario(data);
    });

    // type : EditScenario
    const unsubEditScenario = on(S2CMessageType.EditScenario, (data) => {
      scenarioHandlerRef.current?.HandleEditScenario(data);
    });

    // type : ScenarioError
    const unsubScenarioError = on(S2CMessageType.ScenarioError , (data) => {
      scenarioHandlerRef.current?.HandleScenarioError(data);
    });

    //clean up
    return () => {
      unsubInitData();
      unsubScenarioPlanesSnapshot();
      unsubAddDanerZone();
      unsubRemoveDangerZone();
      unsubEditDangerZone();
      unsubDangerZoneError();
      unsubAddScenario();
      unsubRemoveScenario();
      unsubEditScenario();
      unsubScenarioError();
    };
  }
  // =================================================================
  // =================================================================
  
  return (
    <>
      <CesiumMap viewerRef={viewerRef} onViewerReady={handleViewerReady} />
      <PanelsAndButtons viewerRef={viewerRef} />

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