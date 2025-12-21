import  { useState, useRef, useContext } from 'react';
import TopLeftButtons from '../TopLeftButtons/TopLeftButtons';
import ScenarioPlayControlPanel from '../ScenarioPlayControlPanel/ScenarioPlayControlPanel';
import { SimState } from '../SimState/SimState';
import ScenariosPanel from '../ScenariosPanel/ScenariosPanel';
import ZonesPanel from '../ZonesPanel/ZonesPanel';
import JammersPanel from '../Jamming/JammersPanel/JammersPanel';


interface PanelsAndButtonsProps {
  viewerRef: React.RefObject<any>;
}

export default function PanelsAndButtons({viewerRef} : PanelsAndButtonsProps){

    
    const [showSceanriosPanel, setShowSceanriosPanel] = useState(false);
    const [showDangerZonesPanel, setShowDangerZonesPanel] = useState(false);
    const [showJammersPanel, setShowJammersPanel] = useState(false);

    // ScenarioPlayer instance
    const simStateContext  = useContext(SimState);
    const scenarioPlayer = simStateContext?.simState.scenarioPlayer!;

    // Handlers for opening panels
    const openSceanriosPanel = () => setShowSceanriosPanel(true);
    const openDangerZonesPanel = () => setShowDangerZonesPanel(true);
    const openJammersPanel = () => setShowJammersPanel(true);


    // Handlers for closing panels
    const closeSceanriosPanel = () => setShowSceanriosPanel(false);
    const closeDangerZonesPanel = () => setShowDangerZonesPanel(false);
    const closeJammersPanel = () => setShowJammersPanel(false);


    
    return (
    <>
      {/* Only show buttons if no panels are open */}
      {!showSceanriosPanel && !showDangerZonesPanel && !showJammersPanel && (
        <TopLeftButtons
          onScenariosClick={openSceanriosPanel}
          onDangerZonesClick={openDangerZonesPanel}
          onJammersClick={openJammersPanel}
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

      {showJammersPanel && (
        <JammersPanel
          onClose={closeJammersPanel}
          viewerRef={viewerRef}
        />
      )}

      {showDangerZonesPanel && (
        <ZonesPanel
          onClose={closeDangerZonesPanel}
          viewerRef={viewerRef}
        />
      )}

    </>
  );
}