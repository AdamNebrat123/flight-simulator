import  { useState, useRef, useContext } from 'react';
import { useWebSocket } from '../WebSocket/WebSocketProvider';
import type { DangerZone, GetReadyScenariosRequestCmd, Scenario, PlaySelectedScenario } from '../Messages/AllTypes';
import TopLeftButtons from '../TopLeftButtons/TopLeftButtons';
import CreateTrajectoryPanel from '../CreateTrajectoryPanel/CreateTrajectoryPanel';
import PlayScenarioPanel from '../PlayScenarioPanel/PlayScenarioPanel';
import ScenarioPlayControlPanel from '../ScenarioPlayControlPanel/ScenarioPlayControlPanel';
import DangerZonePanel from '../DangerZonePanel/DangerZonePanel';
import { PlaneEntityManager } from '../Handlers/PlaneEntityManager';
import { PlaneTailManager } from '../Handlers/PlaneTailManager';
import { C2SMessageType } from '../Messages/C2SMessageType';
import { SimState } from '../SimState/SimState';


interface PanelsAndButtonsProps {
  viewerRef: React.RefObject<any>;
}

export default function PanelsAndButtons({viewerRef} : PanelsAndButtonsProps){
    const { isConnected, send, on } = useWebSocket();
    
    const [showCreateTrajectoryPanel, setShowCreateTrajectoryPanel] = useState(false);
    const [showPlayPanel, setShowPlayPanel] = useState(false);
    const [showDangerZonePanel, setShowDangerZonePanel] = useState(false);

    const planeManager = PlaneEntityManager.getInstance(viewerRef.current);
    const planeTailManager = PlaneTailManager.getInstance(viewerRef.current)

    // ScenarioPlayer instance
    const simStateContext  = useContext(SimState);
    const scenarioPlayer = simStateContext?.simState.scenarioPlayer!;

    // Handlers for opening panels
    const openCreateTrajectoryPanel = () => setShowCreateTrajectoryPanel(true);
    const openDangerZonePanel = () => setShowDangerZonePanel(true);
    const openPlayPanel = () => setShowPlayPanel(true);


    // Handlers for closing panels
    const closeCreateTrajectoryPanel = () => setShowCreateTrajectoryPanel(false);
    const closePlayPanel = () => {
        setShowPlayPanel(false);
        scenarioPlayer.selectScenario(null);
        simStateContext?.setSimState({...simStateContext.simState})
    }
    const closeDangerZonePanel = () => setShowDangerZonePanel(false);





    // Save/cancel handlers
    const handleSaveTrajectory = (data: Scenario) => {
        send(C2SMessageType.AddScenario, data);
        setShowCreateTrajectoryPanel(false);
    };

    const handlePlayScenarioClick = (scenarioId: string, scenarioName: string) => {
        if (!scenarioPlayer.selectedScenario) return;
        scenarioPlayer.startScenario(scenarioId, scenarioName);
        scenarioPlayer.selectScenario(null);
        simStateContext?.setSimState({...simStateContext.simState})
        // clear of previous scenarios planes!!
        planeManager!.clearAllEntities();
        // clear all tail of previous scenarios planes!!
        planeTailManager!.clearAllTails();
        closePlayPanel();
    };

    const handleSaveDangerZone = (data: DangerZone | null) => {
        if (!data) return;
        send(C2SMessageType.AddDangerZone, data);
        setShowDangerZonePanel(false);
    };

    
    return (
    <>
      {/* Only show buttons if no panels are open */}
      {!showCreateTrajectoryPanel && !showPlayPanel && !showDangerZonePanel && (
        <TopLeftButtons
          onCreateClick={openCreateTrajectoryPanel}
          onPlayClick={openPlayPanel}
          onCreateDangerZoneClick={openDangerZonePanel}
        />
      )}

      {showCreateTrajectoryPanel && (
        <CreateTrajectoryPanel
          onSave={handleSaveTrajectory}
          onCancel={closeCreateTrajectoryPanel}
          viewerRef={viewerRef}
        />
      )}

      {showPlayPanel && (
        <PlayScenarioPanel
          onPlay={handlePlayScenarioClick}
          onClose={closePlayPanel}
        />
      )}

      {scenarioPlayer.playingScenarioName && (
        
        <ScenarioPlayControlPanel/>
      )}

      {showDangerZonePanel && (
        <DangerZonePanel
          viewerRef={viewerRef}
          onClose={closeDangerZonePanel}
          onSave={handleSaveDangerZone}
        />
      )}
    </>
  );
}