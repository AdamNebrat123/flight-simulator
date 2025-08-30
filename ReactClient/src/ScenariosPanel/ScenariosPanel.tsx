import { useContext, useEffect, useState } from "react";
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
    const { send } = useWebSocket();
    const simStateContext  = useContext(SimState);
    const scenarioPlayer = simStateContext?.simState.scenarioPlayer!;

    const planeManager = PlaneEntityManager.getInstance(viewerRef.current);
    const planeTailManager = PlaneTailManager.getInstance(viewerRef.current);
    const scenarioManager = ScenarioManager.getInstance();
    const [scenarios, setScenarios] = useState<Scenario[]>(scenarioManager.getAllScenarios());

    
    useEffect(() => {
    const unsubscribe = scenarioManager.subscribe((newScenarios: Scenario[]) => {
        setScenarios(newScenarios);
    });

    return () => unsubscribe();
    }, [scenarioManager]);

    const [selectedScenarioName, setSelectedScenarioName] = useState("");
    const [selectedScenarioId, setSelectedScenarioId] = useState("");
    const [selectedScenarioObj, setSelectedScenarioObj] = useState<Scenario | null>(null);

    // create / edit scenario panel
    const [showCreateTrajectoryPanel, setShowCreateTrajectoryPanel] = useState(false);
    const openCreateTrajectoryPanel = () => setShowCreateTrajectoryPanel(true);



    const [onSaveSceanrio , setOnSaveSceanrio] = useState<((data: Scenario) => void) | null>(null);


    const handleSelect = (scenario: Scenario) => {
        scenarioPlayer.selectScenario(scenario.scenarioId);
        simStateContext?.setSimState({ ...simStateContext.simState });
        setSelectedScenarioObj(scenario);
        setSelectedScenarioName(scenario.scenarioName);
        setSelectedScenarioId(scenario.scenarioId);
    };


    // Add Scenario
    const handleAddScenarioClick = () => {
        setSelectedScenarioObj({ planes: [], scenarioName: "ScenarioName", scenarioId: "" });
        setOnSaveSceanrio(() => SaveTrajectory); // set the onSave to Save function
        scenarioPlayer.selectScenario(null);
        openCreateTrajectoryPanel();
    };
    const SaveTrajectory = (data: Scenario) => {
        send(C2SMessageType.AddScenario, data);
        setShowCreateTrajectoryPanel(false);
    };
    const EditTrajectory = (data: Scenario) => {
        send(C2SMessageType.EditScenario, data);
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
        handleClose();
    };

    // On Edit
    const handleEditScenarioClick = () => {
        setSelectedScenarioObj(selectedScenarioObj);
        setOnSaveSceanrio(() => EditTrajectory); // set the onSave to Edit function
        scenarioPlayer.selectScenario(null);
        openCreateTrajectoryPanel();
    };

    // On Remove
    const handleRemoveScenarioClick = () => {
        send(C2SMessageType.RemoveScenario, selectedScenarioObj);
        scenarioPlayer.selectScenario(null);
    };
    
    const handleClose = () => {
        scenarioPlayer.selectScenario(null);
        simStateContext?.setSimState({...simStateContext.simState})
        onClose();
    }
    


    return (
    <>
        {/* if not showing create trajectory panel, show the Scenarios default panel */}
        {!showCreateTrajectoryPanel && (
            <div className="scenario-panel">
            <h1 className="scenariosTitle">Scenarios</h1>

            <button className="addScenario-button" onClick={handleAddScenarioClick}>
                Add scenario
            </button>
            <div className="button-row">
                <button 
                    className="play" 
                    onClick={() => handlePlayScenarioClick()} 
                    disabled={!scenarioPlayer.selectedScenario || scenarios.length === 0}
                >
                    Play
                </button>

                <button 
                    className="edit" 
                    onClick={() => handleEditScenarioClick()} 
                    disabled={!scenarioPlayer.selectedScenario || scenarios.length === 0}
                >
                    Edit
                </button>
                <button 
                    className="remove" 
                    onClick={() => handleRemoveScenarioClick()} 
                    disabled={!scenarioPlayer.selectedScenario || scenarios.length === 0}
                >
                    Remove
                </button>
            </div>

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


            <button onClick={handleClose} className="close-button">
                Close
            </button>
            </div>
        )}

        {showCreateTrajectoryPanel && (
            <CreateTrajectoryPanel 
            initialScenario={selectedScenarioObj!}
            onSave={onSaveSceanrio!}
            onCancel={closeCreateTrajectoryPanel}
            viewerRef={viewerRef}
            />
        )}

    </>
  );
}