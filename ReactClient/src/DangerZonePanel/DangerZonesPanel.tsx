import { useEffect, useState } from "react";
import { C2SMessageType } from "../Messages/C2SMessageType";
import { useWebSocket } from "../WebSocket/WebSocketProvider";
import type { DangerZone } from "../Messages/AllTypes";
import { DangerZoneManager } from "../Managers/DangerZoneManager";
import CreateDangerZonePanel from "./CreateDangerZonePanel";
import "./DangerZonesPanel.css";
import { DangerZoneEntityManager } from "./DangerZoneEntityManager";


interface Props {
  onClose: () => void;
  viewerRef: React.RefObject<any>;
}

export default function DangerZonesPanel({ onClose, viewerRef }: Props){
    const { isConnected, send, on } = useWebSocket();
    const [showCreateDangerZonePanel, setShowCreateDangerZonePanel] = useState(false);
    const [selectedDangerZoneObj, setSelectedDangerZoneObj] = useState<DangerZone | null>(null);
    // saving function for create / edit
    const [onSaveDangerZone , setOnSaveDangerZone] = useState<((data: DangerZone) => void) | null>(null);

    const dangerZoneManager = DangerZoneManager.getInstance();
    const dangerZoneEntityManager = DangerZoneEntityManager.GetInstance(viewerRef.current);
    const [zones, setZones] = useState<DangerZone[]>(dangerZoneManager.getAllDangerZones());

    useEffect(() => {
        const unsubscribe = dangerZoneManager.subscribe((newZones) => {
            setZones(newZones);
        });
        return () => unsubscribe();
    }, [dangerZoneManager]);

    // open / close 
    const openCreateDangerZonePanel = () => setShowCreateDangerZonePanel(true);
    const closeCreateDangerZonePanel = () => {
        setShowCreateDangerZonePanel(false);
        dangerZoneEntityManager.showEntityById(selectedDangerZoneObj?.zoneId!);
        setSelectedDangerZoneObj(null);
    }


    const handleSelect = (dangerZone: DangerZone) => {
        setSelectedDangerZoneObj(dangerZone);
    };


    const handleClose = () => {
        onClose();
        setSelectedDangerZoneObj(null);
    }


    // Add Scenario
    const handleAddDangerZoneClick = () => {
        setSelectedDangerZoneObj({ zoneName: "ZoneName", points: [], topHeight: 100, bottomHeight: 0, zoneId: "" });
        setOnSaveDangerZone(() => SaveDangerZone); // set the onSave to Save function
        openCreateDangerZonePanel();
    };

    // Save/Edit DangerZone functions
    const SaveDangerZone = (data: DangerZone) => {
        send(C2SMessageType.AddDangerZone, data);
        setShowCreateDangerZonePanel(false);
    };
    const EditDangerZone = (data: DangerZone) => {
        send(C2SMessageType.EditDangerZone, data);
        setShowCreateDangerZonePanel(false);
    };

    // On Edit
    const handleEditScenarioClick = () => {
        setSelectedDangerZoneObj(selectedDangerZoneObj);
        setOnSaveDangerZone(() => EditDangerZone); // set the onSave to Edit function
        dangerZoneEntityManager.hideEntityById(selectedDangerZoneObj?.zoneId!);
        openCreateDangerZonePanel();
    };

    // On Remove
    const handleRemoveScenarioClick = () => {
        send(C2SMessageType.RemoveDangerZone, selectedDangerZoneObj);
    };
    
    return (
    <>
        {/* if not showing create trajectory panel, show the Scenarios default panel */}
        {!showCreateDangerZonePanel && (
            <div className="dangerZone-panel">
                <h1 className="dangerZonesTitle">Danger Zones</h1>

                <button className="addDangerZone-button" onClick={handleAddDangerZoneClick}>
                    Add DangerZone
                </button>
                <div className="button-row">
                    <button 
                        className="edit" 
                        onClick={() => handleEditScenarioClick()} 
                        disabled={!selectedDangerZoneObj || zones.length === 0}
                    >
                        Edit
                    </button>
                    <button 
                        className="remove" 
                        onClick={() => handleRemoveScenarioClick()} 
                        disabled={!selectedDangerZoneObj || zones.length === 0}
                    >
                        Remove
                    </button>
                </div>

            {zones.length === 0 && <p>No danger zones yet.</p>}

            <ul className="dangerZone-list">
                {zones.map((zone) => (
                <li
                    key={zone.zoneId}
                    className={`dangerZone-item ${selectedDangerZoneObj?.zoneId === zone.zoneId ? "selected" : ""}`}
                    onClick={() => handleSelect(zone)}
                >
                    {zone.zoneName} 
                </li>
                ))}
            </ul>


            <button onClick={handleClose} className="close-button">
                Close
            </button>
            </div>
        )}

        {showCreateDangerZonePanel && (
            <CreateDangerZonePanel 
            initialDangerZone={selectedDangerZoneObj!}
            onSave={onSaveDangerZone!}
            onClose={closeCreateDangerZonePanel}
            viewerRef={viewerRef}
            />
        )}
    
    </>
    );
}