import  { useState, useRef, useContext } from 'react';
import TopLeftButtons from '../TopLeftButtons/TopLeftButtons';
import ScenarioPlayControlPanel from '../ScenarioPlayControlPanel/ScenarioPlayControlPanel';
import { SimState } from '../SimState/SimState';
import ScenariosPanel from '../ScenariosPanel/ScenariosPanel';


interface PanelsAndButtonsProps {
  viewerRef: React.RefObject<any>;
}

export default function PanelsAndButtons({viewerRef} : PanelsAndButtonsProps){

    
    const [showSceanriosPanel, setShowSceanriosPanel] = useState(false);


    // ScenarioPlayer instance
    const simStateContext  = useContext(SimState);
    const scenarioPlayer = simStateContext?.simState.scenarioPlayer!;

    // Handlers for opening panels
    const openSceanriosPanel = () => setShowSceanriosPanel(true);

    // Handlers for closing panels
    const closeSceanriosPanel = () => setShowSceanriosPanel(false);


    
    return (
    <>
      {/* Only show buttons if no panels are open */}
      {!showSceanriosPanel && (
        <TopLeftButtons
          onScenariosClick={openSceanriosPanel}
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

    </>
  );
}