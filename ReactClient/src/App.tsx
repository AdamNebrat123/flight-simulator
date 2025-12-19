import { useRef, useState, useEffect, useContext } from 'react';
import * as Cesium from 'cesium';
import CesiumMap from './CesiumMap';
import { useWebSocket } from './WebSocket/WebSocketProvider';
import { ToastContainer } from 'react-toastify';
//handler imports
import { ZoneEntityManager } from './ZonesPanel/ZoneEntityManager';
import { ZoneHandler } from './Zones/ZoneHandler';
import { S2CMessageType } from './Messages/S2CMessageType';
import { handleInitData } from './InitData/InitDataHandler';
import PanelsAndButtons from './PanelsAndButtons/PanelsAndButtons';
import { PlaneEntityManager } from './Scenarios/AirCrafts/PlaneEntityManager';
import { PlaneTailManager } from './Scenarios/AirCrafts/PlaneTailManager';
import { ScenarioPlanesSnapshotHandler } from './Scenarios/Handlers/ScenarioPlanesSnapshotHandler';
import { ScenarioHandler } from './Scenarios/ScenarioHandler';


export default function App() {
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const { on } = useWebSocket();


  //needed for ScenarioPlanesSnapshotHandler
  let planeEntityManager: PlaneEntityManager | null;
  let planeTailManager: PlaneTailManager | null;
  const dangerZoneEntityManagerRef = useRef<ZoneEntityManager | null>(null)
  const ScenarioPlanesSnapshotHandlerRef = useRef<ScenarioPlanesSnapshotHandler | null>(null)
  const dangerZoneHandlerRef =  useRef<ZoneHandler | null>(null);

  const scenarioHandlerRef = useRef<ScenarioHandler | null>(null);


  // when a viewer it initialized, this function is run, everything that need the viewer should be put here
  const handleViewerReady = () => {
    if (viewerRef.current) {
      
      planeEntityManager = PlaneEntityManager.getInstance(viewerRef.current);
      planeTailManager = PlaneTailManager.getInstance(viewerRef.current)
      dangerZoneEntityManagerRef.current = ZoneEntityManager.GetInstance(viewerRef.current);

      ScenarioPlanesSnapshotHandlerRef.current = new ScenarioPlanesSnapshotHandler(
        planeEntityManager,
        planeTailManager, 
        dangerZoneEntityManagerRef.current
      );

      dangerZoneHandlerRef.current = ZoneHandler.getInstance(viewerRef.current);
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
    const unsubAddDanerZone = on(S2CMessageType.AddZone , (data) => {
      dangerZoneHandlerRef.current?.HandleAddZone(data);
    });

    // type : RemoveDangerZone
    const unsubRemoveDangerZone = on(S2CMessageType.RemoveZone , (data) => {
      dangerZoneHandlerRef.current?.HandleRemoveZone(data);
    });

    // type : EditDangerZone
    const unsubEditDangerZone = on(S2CMessageType.EditZone , (data) => {
      dangerZoneHandlerRef.current?.HandleEditZone(data);
    });

    // type : DangerZoneError
    const unsubDangerZoneError = on(S2CMessageType.DangerError , (data) => {
      dangerZoneHandlerRef.current?.HandleZoneError(data);
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