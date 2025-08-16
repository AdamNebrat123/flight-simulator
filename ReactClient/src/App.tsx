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
import { PlaneTailManager } from './Handlers/PlaneTailManager';
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
  const planeTailManagerRef = useRef<PlaneTailManager | null>(null) 

  // when a viewer it initialized, this function is run, everything that need the viewer should be put here
  const handleViewerReady = () => {
    if (viewerRef.current && !planeManagerRef.current) {
      planeManagerRef.current = new PlaneEntityManager(viewerRef.current);
      planeTailManagerRef.current = new PlaneTailManager(viewerRef.current)
      console.log("PlaneEntityManager created");
    }
  };

  // register to all the events (give a handler for each type of msg.)
  // =================================================================
  // =================================================================
  useEffect(() => {
    // type : MultiPlaneTrajectoryResult
    const unsubMultiPlaneTrajectoryResult = on("MultiPlaneTrajectoryResult", (data) => {
      MultiPlaneTrajectoryResultHandler(data, planeManagerRef.current!, planeTailManagerRef.current!);
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
    // clear of previous scenarios planes!!
    planeManagerRef.current?.clearAllEntities();
    // clear all tail of previous scenarios planes!!
    planeTailManagerRef.current?.clearAllTails();
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




  // testing
  // ============================================================
  // ============================================================
  // ============================================================
  const polygonPoints = [
  { lon: 34.789038498818336, lat: 32.03231874951673 },
  { lon: 34.78838792050164, lat: 32.032695977005346 },
  { lon: 34.78766925257639, lat: 32.03243164454725 },
  { lon: 34.787329530312164, lat: 32.03180822168283 },
  { lon: 34.78748846676368, lat: 32.03136453852265 },
  { lon: 34.78814514577472, lat: 32.031127268161605 },
  { lon: 34.78889466380484, lat: 32.03136271546502 },
  { lon: 34.7892587196574, lat: 32.031923949650924 }
];

const createForbiddenZone = () => {
  const bottomHeight = 0; // meters
  const topHeight = 150;   // meters

  if (!viewerRef) return;

  const polygonPositions = polygonPoints.map(p =>
    Cesium.Cartesian3.fromDegrees(p.lon, p.lat, bottomHeight)
  );

  viewerRef.current!.entities.add({
    polygon: {
      hierarchy: polygonPositions,
      perPositionHeight: true,
      extrudedHeight: topHeight,
      material: Cesium.Color.RED.withAlpha(0.3), // classic forbidden zone
      outline: true,
      outlineColor: Cesium.Color.RED
    }
  });
};
// ============================================================
// ============================================================
// ============================================================
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



      <div
  style={{
    position: 'absolute',
    top: '120px',
    left: '20px',
    zIndex: 9999, // make sure it’s above Cesium canvas
  }}
>
  <button onClick={createForbiddenZone}>Polygon</button>
</div>




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