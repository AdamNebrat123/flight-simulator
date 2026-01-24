import { useEffect, useRef, useState } from "react";
import type { DangerZone, Zone } from "../Messages/AllTypes";
import "./ZonesPanel.css";
import CreateZonePanel from "./CreateZonePanel";
import type { ZoneHandler } from "../Zones/ZoneHandler";
import { TemporaryZoneEntityManager } from "../Zones/TemporaryZoneEntityManager";


interface Props {
  zones: Zone[]
  setZones: React.Dispatch<React.SetStateAction<Zone[]>>;
  viewerRef: React.RefObject<any>;
}

export default function ZonesPanel({zones, setZones, viewerRef }: Props){
    const [showCreateDangerZonePanel, setShowCreateDangerZonePanel] = useState(false);
    const [selectedZoneObj, setSelectedZoneObj] = useState<Zone | null>(null);
    // saving function for create / edit
    const [onSaveZone , setOnSaveZone] = useState<((data: Zone) => void) | null>(null);
    const zoneHandlerRef =  useRef<ZoneHandler | null>(null);

    const temporaryZoneEntityManager = TemporaryZoneEntityManager.GetInstance(viewerRef.current);

    // open / close 
    const openCreateDangerZonePanel = () => setShowCreateDangerZonePanel(true);
    const closeCreateDangerZonePanel = () => {
        setShowCreateDangerZonePanel(false);
        temporaryZoneEntityManager.showEntityById(selectedZoneObj?.zoneName!);
        setSelectedZoneObj(null);
    }


    const handleSelect = (zone: Zone) => {
        setSelectedZoneObj(zone);
    };



    const handleAddZoneClick = () => {
        setSelectedZoneObj({ zoneType: "Danger", zoneName: "ZoneName", points: [], topHeight: 100, bottomHeight: 0});
        setOnSaveZone(() => SaveZone); // set the onSave to Save function
        openCreateDangerZonePanel();
    };

    // Save/Edit DangerZone functions
    const SaveZone = (zone: Zone) => {
        setZones([...zones, zone])
        zoneHandlerRef.current?.HandleAddZone(zone);
        temporaryZoneEntityManager.tryAddZone(zone);
        setShowCreateDangerZonePanel(false);
    };
    const EditZone = (updatedZone: Zone) => {
        let zone : Zone = zones.filter(z => z.zoneName == zone.zoneName)?.[0]
        if(zone != null)
            zone = updatedZone;
        setZones([...zones])
        temporaryZoneEntityManager.editZone(zone);

        setShowCreateDangerZonePanel(false);
    };

    // On Edit
    const handleEditZoneClick = () => {
        setSelectedZoneObj(selectedZoneObj);
        setOnSaveZone(() => EditZone); // set the onSave to Edit function
        temporaryZoneEntityManager.hideEntityById(selectedZoneObj?.zoneName!);
        openCreateDangerZonePanel();
    };

    // On Remove
    const handleRemoveZoneClick = () => {
        if(selectedZoneObj){
            temporaryZoneEntityManager.removeZone(selectedZoneObj.zoneName);
            const newZones = zones.filter(z => z.zoneName != selectedZoneObj.zoneName)
            setZones([...newZones])
        }
    };
    
    return (
    <>
        {/* if not showing create trajectory panel, show the Scenarios default panel */}
        {!showCreateDangerZonePanel && (
            <div>
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
                    key={zone.zoneName}
                    className={`dangerZone-item ${selectedZoneObj?.zoneName === zone.zoneName ? "selected" : ""}`}
                    onClick={() => handleSelect(zone)}
                >
                    {zone.zoneName} 
                </li>
                ))}
            </ul>

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