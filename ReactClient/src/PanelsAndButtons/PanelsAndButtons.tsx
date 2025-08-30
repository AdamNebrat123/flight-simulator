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
import ScenariosPanel from '../ScenariosPanel/ScenariosPanel';


interface PanelsAndButtonsProps {
  viewerRef: React.RefObject<any>;
}

export default function PanelsAndButtons({viewerRef} : PanelsAndButtonsProps){
    const { isConnected, send, on } = useWebSocket();
    
    const [showSceanriosPanel, setShowSceanriosPanel] = useState(false);
    const [showDangerZonePanel, setShowDangerZonePanel] = useState(false);
/*
    const planeManager = PlaneEntityManager.getInstance(viewerRef.current);
    const planeTailManager = PlaneTailManager.getInstance(viewerRef.current);
*/
    // ScenarioPlayer instance
    const simStateContext  = useContext(SimState);
    const scenarioPlayer = simStateContext?.simState.scenarioPlayer!;

    // Handlers for opening panels
    const openSceanriosPanel = () => setShowSceanriosPanel(true);
    const openDangerZonePanel = () => setShowDangerZonePanel(true);


    // Handlers for closing panels
    const closeSceanriosPanel = () => setShowSceanriosPanel(false);
    const closeDangerZonePanel = () => setShowDangerZonePanel(false);

    const handleSaveDangerZone = (data: DangerZone | null) => {
        if (!data) return;
        send(C2SMessageType.AddDangerZone, data);
        setShowDangerZonePanel(false);
    };

    
    return (
    <>
      {/* Only show buttons if no panels are open */}
      {!showSceanriosPanel && !showDangerZonePanel && (
        <TopLeftButtons
          onScenariosClick={openSceanriosPanel}
          onCreateDangerZoneClick={openDangerZonePanel}
        />
      )}


      {showSceanriosPanel && (
        <ScenariosPanel
          onClose={closeSceanriosPanel}
          viewerRef={viewerRef}
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