import { useRef, useState, useEffect } from 'react';
import * as Cesium from 'cesium';
import CesiumMap from './CesiumMap';
import TopLeftButtons from './TrajectoryScenario/TopLeftButtons';
import CreateTrajectoryPanel from './TrajectoryScenario/CreateTrajectoryPanel';
import type { PlanesTrajectoryPointsScenario,GetReadyScenariosRequestCmd, ScenariosReadyToPlay, PlaySelectedScenario, ResumeScenarioCmd, PauseScenarioCmd, ChangeScenarioPlaySpeedCmd } from './Messages/AllTypes';
import { useWebSocket } from './WebSocket/WebSocketProvider';
import { ToastContainer } from 'react-toastify';
import PlayScenarioPanel from './PlayScenario/PlayScenarioPanel';
import ScenarioPlayControlPanel from './Scenario/ScenarioPlayControlPanel';

//handler imports
import { PlaneEntityManager } from './Handlers/PlaneEntityManager';
import { MultiPlaneTrajectoryResultHandler } from './Handlers/MultiPlaneTrajectoryResultHandler';


export default function App() {
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const [showCreateTrajectoryPanel, setshowCreateTrajectoryPanel] = useState(false);
  const [showPlayPanel, setShowPlayPanel] = useState(false);
  const [scenarios, setScenarios] = useState<string[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [playingScenarioName, setPlayingScenarioName] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1);
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
  // =================================================================
  // =================================================================
  useEffect(() => {
    // type : MultiPlaneTrajectoryResult
    const unsubMultiPlaneTrajectoryResult = on("MultiPlaneTrajectoryResult", (data) => {
      MultiPlaneTrajectoryResultHandler(data, planeManagerRef.current!);
    });
    // type : ScenariosReadyToPlay
    const unsubScenariosReadyToPlay = on("ScenariosReadyToPlay", (data) => {
      try{
      const scenariosReadyToPlay = data as ScenariosReadyToPlay;
      setScenarios(scenariosReadyToPlay.scenariosNames);
      setSelectedScenario(null); // reset selection on new list
      }
      catch (err){
        console.log("data could not be parsed to ScenariosReadyToPlay")
      }
    });

    //clean up
    return () => {
      unsubMultiPlaneTrajectoryResult();
      unsubScenariosReadyToPlay();
    };
  }, []);
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
    //close selecting panel
    handleClosePlayPanel();
    // Set playing scenario to show control panel
    startPlayingScenario(selectedScenario!);
  };

  const handleOpenPanel = () => {
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

  return (
    <>
      <CesiumMap viewerRef={viewerRef} onViewerReady={handleViewerReady} />
      {!showCreateTrajectoryPanel && !showPlayPanel && (
        <TopLeftButtons
          onCreateClick={handleOpenPanel}
          onPlayClick={handleOpenPlayPanel}
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