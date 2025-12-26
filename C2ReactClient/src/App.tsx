import { useRef, useState, useEffect, useContext } from 'react';
import * as Cesium from 'cesium';
import CesiumMap from './CesiumMap';
import { useWebSocket } from './WebSocket/WebSocketProvider';
import { ToastContainer } from 'react-toastify';
//handler imports
import { ZoneHandler } from './Zones/ZoneHandler';
import { S2CMessageType } from './Messages/S2CMessageType';
import { handleInitData } from './InitData/InitDataHandler';
import PanelsAndButtons from './PanelsAndButtons/PanelsAndButtons';
import { PlaneEntityManager } from './Scenarios/AirCrafts/PlaneEntityManager';
import { PlaneTailManager } from './Scenarios/AirCrafts/PlaneTailManager';
import { ScenarioPlanesSnapshotHandler } from './Scenarios/Handlers/ScenarioPlanesSnapshotHandler';
import { ScenarioHandler } from './Scenarios/ScenarioHandler';
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
  const scenarioHandlerRef = useRef<ScenarioHandler | null>(null);
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

    // type : AddZone
    const unsubAddZone = on(S2CMessageType.AddZone , (data) => {
      zoneHandlerRef.current?.HandleAddZone(data);
    });

    // type : RemoveZone
    const unsubRemoveZone = on(S2CMessageType.RemoveZone , (data) => {
      zoneHandlerRef.current?.HandleRemoveZone(data);
    });

    // type : EditZone
    const unsubEditZone = on(S2CMessageType.EditZone , (data) => {
      zoneHandlerRef.current?.HandleEditZone(data);
    });

    // type : ZoneError
    const unsubZoneError = on(S2CMessageType.ZoneError , (data) => {
      zoneHandlerRef.current?.HandleZoneError(data);
    });

    // type : AddJammer
    const unsubAddJammer = on(S2CMessageType.AddJammer, (data) => {
      jammerHandlerRef.current?.HandleAddJammer(data);
    });

    // type : RemoveJammer
    const unsubRemoveJammer = on(S2CMessageType.RemoveJammer, (data) => {
      jammerHandlerRef.current?.HandleRemoveJammer(data);
    });

    // type : EditJammer
    const unsubEditJammer = on(S2CMessageType.EditJammer, (data) => {
      jammerHandlerRef.current?.HandleEditJammer(data);
    });

    // type : JammerError
    const unsubJammerError = on(S2CMessageType.JammerError , (data) => {
      jammerHandlerRef.current?.HandleJammerError(data);
    });

    // type : JammersUpdate
    const unsubJammersUpdate = on(S2CMessageType.JammersUpdate , (data) => {
      jammersUpdateHandlerRef.current?.HandleJammersUpdate(data);
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
      unsubAddZone();
      unsubRemoveZone();
      unsubEditZone();
      unsubZoneError();
      unsubAddJammer();
      unsubRemoveJammer();
      unsubEditJammer();
      unsubJammerError();
      unsubJammersUpdate();
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