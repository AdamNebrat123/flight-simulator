import { useRef, useState, useEffect, useContext } from 'react';
import * as Cesium from 'cesium';
import CesiumMap from './CesiumMap';
import TopLeftButtons from './TopLeftButtons/TopLeftButtons';
import CreateTrajectoryPanel from './CreateTrajectoryPanel/CreateTrajectoryPanel';
import type { PlanesTrajectoryPointsScenario,GetReadyScenariosRequestCmd, ScenariosReadyToPlay, PlaySelectedScenario, ResumeScenarioCmd, PauseScenarioCmd, ChangeScenarioPlaySpeedCmd, DangerZone } from './Messages/AllTypes';
import { useWebSocket } from './WebSocket/WebSocketProvider';
import { ToastContainer } from 'react-toastify';
import PlayScenarioPanel from './PlayScenarioPanel/PlayScenarioPanel';
import ScenarioPlayControlPanel from './ScenarioPlayControlPanel/ScenarioPlayControlPanel';
import DangerZonePanel from './DangerZonePanel/DangerZonePanel';
//handler imports
import { PlaneEntityManager } from './Handlers/PlaneEntityManager';
import { PlaneTailManager } from './Handlers/PlaneTailManager';
import { MultiPlaneTrajectoryResultHandler } from './Handlers/MultiPlaneTrajectoryResultHandler';
import { DangerZoneEntityManager } from './DangerZonePanel/DangerZoneEntityManager';
import { DangerZoneHandler } from './Handlers/DangerZoneHandler';
import { S2CMessageType } from './Messages/S2CMessageType';
import { handleInitData } from './Handlers/InitDataHandler';
import PanelsAndButtons from './PanelsAndButtons/PanelsAndButtons';
import { ScenarioPlayer } from './ScenarioPlayControlPanel/ScenarioPlayer';
import { SimState } from './SimState/SimState';


export default function App() {
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const [showCreateTrajectoryPanel, setshowCreateTrajectoryPanel] = useState(false);
  const [showPlayPanel, setShowPlayPanel] = useState(false);
  const [scenarios, setScenarios] = useState<string[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [playingScenarioName, setPlayingScenarioName] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1);
  const [showDangerZonePanel, setShowDangerZonePanel] = useState(false);
  const { isConnected, send, on } = useWebSocket()


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

  // Open Play Scenario panel
  const handleOpenPlayPanel = () => {
    const data: GetReadyScenariosRequestCmd = {};
    send("GetReadyScenariosRequestCmd", data);
    setShowPlayPanel(true);
  };

  // Close Play Scenario panel
  const handleClosePlayPanel = () => {
    setShowPlayPanel(false);
    setScenarios([]);
    setSelectedScenario(null)

  };
  
  const handlePlayScenario = () => {
    console.log(`Playing scenario: ${selectedScenario}`);
    const data: PlaySelectedScenario = {scenarioName: selectedScenario!}
    console.log(data);
    send("PlaySelectedScenarioCmd", data)
    // clear of previous scenarios planes!!
    planeManager!.clearAllEntities();
    // clear all tail of previous scenarios planes!!
    planeTailManager!.clearAllTails();
    //close selecting panel
    handleClosePlayPanel();
    // Set playing scenario to show control panel
    startPlayingScenario(selectedScenario!);
  };

  const handleOpenCreateTrajectoryPanel = () => {
    setshowCreateTrajectoryPanel(true);
  };

  // Scenario play Control panel
  // ============================================================
  const closePlayControlPanel = () => {
  setPlayingScenarioName(null);
  setIsPaused(false);
  setPlaySpeed(1);
  // currently do nothing.
  };

  const startPlayingScenario = (scenarioName: string) => {
  setPlayingScenarioName(scenarioName);
  setIsPaused(false);
  setPlaySpeed(1);
  };
  const handlePause = () => {
  setIsPaused(true);
  //send data to server
  const data: PauseScenarioCmd = {
    scenarioName: playingScenarioName!
  };
  send("PauseScenarioCmd", data);
  console.log("Paused")
  };

  const handleResume = () => {
  setIsPaused(false);
  //send data to server
  const data: ResumeScenarioCmd = {
    scenarioName: playingScenarioName!
  };
  send("ResumeScenarioCmd", data);
  console.log("Resumed")
  };

const handlePlaySpeedChange = (playSpeed: number) => {
  setPlaySpeed(playSpeed);
  //send data to server
  const data: ChangeScenarioPlaySpeedCmd = {
    scenarioName: playingScenarioName!,
    playSpeed: playSpeed
  };
  send("ChangeScenarioPlaySpeedCmd", data);
  console.log("Changed play speed to: ", playSpeed)
  };
  // ============================================================

  const handleSave = (data: PlanesTrajectoryPointsScenario) => {
    console.log('Saved trajectory scenario', data);
    setshowCreateTrajectoryPanel(false);
    send("PlanesTrajectoryPointsScenario", data)
  };

  const handleCancel = (data: PlanesTrajectoryPointsScenario) => {
    console.log('canceled trajectory scenario', data);
    setshowCreateTrajectoryPanel(false);
  };

  // Danger zone panel component
  // ============================================================
  const handleOpenDangerZonePanel = () => {
    setShowDangerZonePanel(true);
  };

  const handleCloseDangerZonePanel = () => {
    setShowDangerZonePanel(false);
  };

  const handleSaveDangerZonePanel = (data: DangerZone | null) => {
    if(data === null)
      return;
    console.log('sent danger zone:', data);
    send("AddDangerZone", data)
    //send to server!!!!!!!!!!!!!!!!

    setShowDangerZonePanel(false);
  };

  // ============================================================

  
  return (
    <>
      <CesiumMap viewerRef={viewerRef} onViewerReady={handleViewerReady} />
      <PanelsAndButtons viewerRef={viewerRef} />

                                                                  { /*
      {!showDangerZonePanel && !showCreateTrajectoryPanel && !showPlayPanel && (
        <TopLeftButtons
          onCreateClick={handleOpenCreateTrajectoryPanel}
          onPlayClick={handleOpenPlayPanel}
          onCreateDangerZoneClick={handleOpenDangerZonePanel}
        />
      )}
      {showCreateTrajectoryPanel && (
        <CreateTrajectoryPanel
          onSave={handleSave}
          onCancel={handleCancel}
          viewerRef={viewerRef}
        />
      )}

      {showPlayPanel && (
        <PlayScenarioPanel
          onPlay={handlePlayScenario}
          onClose={handleClosePlayPanel}
          scenarios={scenarios}
          selectedScenario={selectedScenario}
          onSelect={setSelectedScenario}
        />
      )}

      {playingScenarioName && (
        <ScenarioPlayControlPanel
          scenarioName={playingScenarioName}
          isPaused={isPaused}
          playSpeed={playSpeed}
          onPause={handlePause}
          onResume={handleResume}
          onChangeSpeed={handlePlaySpeedChange}
          onClose={closePlayControlPanel}
        />
      )}
      {showDangerZonePanel && (
        <DangerZonePanel
          onClose={handleCloseDangerZonePanel}
          onSave={handleSaveDangerZonePanel}
          viewerRef={viewerRef}
        />
      )}
                                                                  */}


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