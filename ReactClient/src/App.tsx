import { useRef, useState, useEffect, useContext } from 'react';
import * as Cesium from 'cesium';
import CesiumMap from './CesiumMap';
import type { ScenariosReadyToPlay } from './Messages/AllTypes';
import { useWebSocket } from './WebSocket/WebSocketProvider';
import { ToastContainer } from 'react-toastify';
//handler imports
import { PlaneEntityManager } from './Handlers/PlaneEntityManager';
import { PlaneTailManager } from './Handlers/PlaneTailManager';
import { MultiPlaneTrajectoryResultHandler } from './Handlers/MultiPlaneTrajectoryResultHandler';
import { DangerZoneEntityManager } from './DangerZonePanel/DangerZoneEntityManager';
import { DangerZoneHandler } from './Handlers/DangerZoneHandler';
import { S2CMessageType } from './Messages/S2CMessageType';
import { handleInitData } from './Handlers/InitDataHandler';
import PanelsAndButtons from './PanelsAndButtons/PanelsAndButtons';
import { SimState } from './SimState/SimState';


export default function App() {
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const { on } = useWebSocket()


  //needed for MultiPlaneTrajectoryResult
  let planeManager: PlaneEntityManager | null;
  let planeTailManager: PlaneTailManager | null;
  const dangerZoneEntityManagerRef = useRef<DangerZoneEntityManager | null>(null)
  const multiPlaneTrajectoryResultHandler = useRef<MultiPlaneTrajectoryResultHandler | null>(null) 
  const dangerZoneHandlerRef =  useRef<DangerZoneHandler | null>(null);
  const simStateContext  = useContext(SimState);
  const scenarioPlayer = simStateContext?.simState.scenarioPlayer!;


  // when a viewer it initialized, this function is run, everything that need the viewer should be put here
  const handleViewerReady = () => {
    if (viewerRef.current) {
      
      planeManager = PlaneEntityManager.getInstance(viewerRef.current);
      planeTailManager = PlaneTailManager.getInstance(viewerRef.current)
      dangerZoneEntityManagerRef.current = DangerZoneEntityManager.GetInstance(viewerRef.current);

      multiPlaneTrajectoryResultHandler.current = new MultiPlaneTrajectoryResultHandler(
        planeManager,
        planeTailManager, 
        dangerZoneEntityManagerRef.current
      );

      dangerZoneHandlerRef.current = DangerZoneHandler.getInstance(viewerRef.current);

      // register to all of the events
      RegisterHandlers();
    }
  };

  // register to all of the events (give a handler for each type of msg.)
  // =================================================================
  // =================================================================
  const RegisterHandlers = () => {
    // type : MultiPlaneTrajectoryResult
    const unsubMultiPlaneTrajectoryResult = on(S2CMessageType.MultiPlaneTrajectoryResult , (data) => {
      multiPlaneTrajectoryResultHandler.current?.HandleMultiPlaneTrajectoryResult(data);
    });
    // type : ScenariosReadyToPlay
    const unsubScenariosReadyToPlay = on(S2CMessageType.ScenariosReadyToPlay, (data) => {
      try{
      const scenariosReadyToPlay = data as ScenariosReadyToPlay;
      scenarioPlayer.setScenarios(scenariosReadyToPlay.scenariosNames)
      scenarioPlayer.selectScenario(null);
      simStateContext?.setSimState({...simStateContext.simState})
      }
      catch (err){
        console.log("data could not be parsed to ScenariosReadyToPlay")
      }
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

    const unsubInitData = on(S2CMessageType.InitData,(data) => {
      console.log("handleInitData");
      handleInitData(data, viewerRef.current!);
    });

    //clean up
    return () => {
      unsubMultiPlaneTrajectoryResult();
      unsubScenariosReadyToPlay();
      unsubAddDanerZone();
      unsubRemoveDangerZone();
      unsubEditDangerZone();
      unsubDangerZoneError();
      unsubInitData();

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