import { useEffect, useState } from "react";
import { C2SMessageType } from "../Messages/C2SMessageType";
import { useWebSocket } from "../WebSocket/WebSocketProvider";
import type { DangerZone, Zone } from "../Messages/AllTypes";
import { ZoneManager } from "../Zones/ZoneManager";
import "./ZonesPanel.css";
import { ZoneEntityManager } from "./ZoneEntityManager";
import CreateZonePanel from "./CreateZonePanel";


interface Props {
  onClose: () => void;
  viewerRef: React.RefObject<any>;
}

export default function ZonesPanel({ onClose, viewerRef }: Props){
    const { isConnected, send, on } = useWebSocket();
    const [showCreateDangerZonePanel, setShowCreateDangerZonePanel] = useState(false);
    const [selectedZoneObj, setSelectedZoneObj] = useState<Zone | null>(null);
    // saving function for create / edit
    const [onSaveZone , setOnSaveZone] = useState<((data: Zone) => void) | null>(null);

    const zoneManager = ZoneManager.getInstance();
    const zoneEntityManager = ZoneEntityManager.GetInstance(viewerRef.current);
    const [zones, setZones] = useState<Zone[]>(zoneManager.getAllZones());

    useEffect(() => {
        const unsubscribe = zoneManager.subscribe((newZones) => {
            setZones(newZones);
        });
        return () => unsubscribe();
    }, [zoneManager]);

    // open / close 
    const openCreateDangerZonePanel = () => setShowCreateDangerZonePanel(true);
    const closeCreateDangerZonePanel = () => {
        setShowCreateDangerZonePanel(false);
        zoneEntityManager.showEntityById(selectedZoneObj?.zoneId!);
        setSelectedZoneObj(null);
    }


    const handleSelect = (zone: Zone) => {
        setSelectedZoneObj(zone);
    };


    const handleClose = () => {
        onClose();
        setSelectedZoneObj(null);
    }


    const handleAddZoneClick = () => {
        setSelectedZoneObj({ zoneName: "ZoneName", points: [], topHeight: 100, bottomHeight: 0, zoneId: "", zoneType: "" });
        setOnSaveZone(() => SaveZone); // set the onSave to Save function
        openCreateDangerZonePanel();
    };

    // Save/Edit DangerZone functions
    const SaveZone = (data: DangerZone) => {
        send(C2SMessageType.AddZone, data);
        setShowCreateDangerZonePanel(false);
    };
    const EditZone = (data: DangerZone) => {
        send(C2SMessageType.EditZone, data);
        setShowCreateDangerZonePanel(false);
    };

    // On Edit
    const handleEditZoneClick = () => {
        setSelectedZoneObj(selectedZoneObj);
        setOnSaveZone(() => EditZone); // set the onSave to Edit function
        zoneEntityManager.hideEntityById(selectedZoneObj?.zoneId!);
        openCreateDangerZonePanel();
    };

    // On Remove
    const handleRemoveZoneClick = () => {
        send(C2SMessageType.RemoveZone, selectedZoneObj);
    };
    
    return (
    <>
        {/* if not showing create trajectory panel, show the Scenarios default panel */}
        {!showCreateDangerZonePanel && (
            <div className="dangerZone-panel">
                <h1 className="dangerZonesTitle">Danger Zones</h1>

                <button className="addDangerZone-button" onClick={handleAddZoneClick}>
                    Add DangerZone
                </button>
                <div className="button-row">
                    <button 
                        className="edit" 
                        onClick={() => handleEditZoneClick()} 
                        disabled={!selectedZoneObj || zones.length === 0}
                    >
                        Edit
                    </button>
                    <button 
                        className="remove" 
                        onClick={() => handleRemoveZoneClick()} 
                        disabled={!selectedZoneObj || zones.length === 0}
                    >
                        Remove
                    </button>
                </div>

            {zones.length === 0 && <p>No danger zones yet.</p>}

            <ul className="dangerZone-list">
                {zones.map((zone) => (
                <li
                    key={zone.zoneId}
                    className={`dangerZone-item ${selectedZoneObj?.zoneId === zone.zoneId ? "selected" : ""}`}
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
            <CreateZonePanel 
            initialZone={selectedZoneObj!}
            onSave={onSaveZone!}
            onClose={closeCreateDangerZonePanel}
            viewerRef={viewerRef}
            />
        )}
    
    </>
    );
}