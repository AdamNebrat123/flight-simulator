import { useContext, useState } from "react";
import { ScenarioManager } from "../Managers/ScenarioManager";
import "./ScenariosPanel.css"
import { SimState } from "../SimState/SimState";
import { PlaneEntityManager } from "../Handlers/PlaneEntityManager";
import { PlaneTailManager } from "../Handlers/PlaneTailManager";
import type { Scenario } from "../Messages/AllTypes";
import CreateTrajectoryPanel from "../CreateTrajectoryPanel/CreateTrajectoryPanel";
import { C2SMessageType } from "../Messages/C2SMessageType";
import { useWebSocket } from "../WebSocket/WebSocketProvider";


interface Props {
  onClose: () => void;
  viewerRef: React.RefObject<any>;
}

export default function ScenariosPanel({ onClose, viewerRef }: Props){
    const { isConnected, send, on } = useWebSocket();
    const simStateContext  = useContext(SimState);
    const scenarioPlayer = simStateContext?.simState.scenarioPlayer!;

    const planeManager = PlaneEntityManager.getInstance(viewerRef.current);
    const planeTailManager = PlaneTailManager.getInstance(viewerRef.current);
    const scenarioManager = ScenarioManager.getInstance();
    const scenarios = scenarioManager.getAllScenarios();

    const [selectedScenarioName, setSelectedScenarioName] = useState("");
    const [selectedScenarioId, setSelectedScenarioId] = useState("");
    const [selectedScenarioObj, setSelectedScenarioIdObj] = useState<Scenario | null>(null);

    // create / edit scenario panel
    const [showCreateTrajectoryPanel, setShowCreateTrajectoryPanel] = useState(false);
    const openCreateTrajectoryPanel = () => setShowCreateTrajectoryPanel(true);


    const handleSelect = (scenario: Scenario) => {
        scenarioPlayer.selectScenario(scenario.scenarioId);
        simStateContext?.setSimState({ ...simStateContext.simState });
        setSelectedScenarioIdObj(scenario);
        setSelectedScenarioName(scenario.scenarioName);
        setSelectedScenarioId(scenario.scenarioId);
    };


    // Add Scenario
    const handleAddScenarioClick = () => {
        setSelectedScenarioIdObj({ planes: [], scenarioName: "ScenarioName", scenarioId: "" });
        openCreateTrajectoryPanel();
    };
    const handleSaveTrajectory = (data: Scenario) => {
        send(C2SMessageType.AddScenario, data);
        setShowCreateTrajectoryPanel(false);
    };
    const closeCreateTrajectoryPanel = () => setShowCreateTrajectoryPanel(false);

    // On Play
    const handlePlayScenarioClick = () => {
        if (!scenarioPlayer.selectedScenario) return;
        scenarioPlayer.startScenario(selectedScenarioId, selectedScenarioName);
        scenarioPlayer.selectScenario(null);
        simStateContext?.setSimState({...simStateContext.simState})
        // clear of previous scenarios planes!!
        planeManager!.clearAllEntities();
        // clear all tail of previous scenarios planes!!
        planeTailManager!.clearAllTails();
        // close Scenarios panel
        onClose();
    };

    // On Edit
    const handleEditScenarioClick = () => {
        setSelectedScenarioIdObj(selectedScenarioObj);
        openCreateTrajectoryPanel();
    };

    // On Remove
    const handleRemoveScenarioClick = () => {
        send(C2SMessageType.RemoveScenario, selectedScenarioObj);
    };
    
    


    return (
    <>
        {/* if not showing create trajectory panel, show the Scenarios default panel */}
        {!showCreateTrajectoryPanel && (
            <div className="scenario-panel">
            <h3>Play Scenario</h3>

            <button onClick={handleAddScenarioClick}>
                Add scenario
            </button>

            {scenarios.length === 0 && <p>No scenarios yet.</p>}

            <ul className="scenario-list">
                {scenarios.map((scenario) => (
                <li
                    key={scenario.scenarioId}
                    className={`scenario-item ${scenarioPlayer.selectedScenario === scenario.scenarioId ? "selected" : ""}`}
                    onClick={() => handleSelect(scenario)}
                >
                    {scenario.scenarioName}
                </li>
                ))}
            </ul>

            <button onClick={() => handlePlayScenarioClick()} disabled={!scenarioPlayer.selectedScenario}>
                Play
            </button>
            <button onClick={() => handleRemoveScenarioClick()} disabled={!scenarioPlayer.selectedScenario}>
                Remove
            </button>
            <button onClick={() => handleEditScenarioClick()} disabled={!scenarioPlayer.selectedScenario}>
                Edit
            </button>
            <button onClick={onClose} style={{ marginLeft: 8 }}>
                Close
            </button>
            </div>
        )}

        {showCreateTrajectoryPanel && (
            <CreateTrajectoryPanel 
            initialScenario={selectedScenarioObj!}
            onSave={handleSaveTrajectory}
            onCancel={closeCreateTrajectoryPanel}
            viewerRef={viewerRef}
            />
        )}

    </>
  );
}