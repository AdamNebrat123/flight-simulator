import { useEffect, useState } from "react";
import "./JammersPanel.css";
import { useWebSocket } from "../../WebSocket/WebSocketProvider";
import type { Jammer } from "../../Sensors/Jammer/Jammer";
import { C2SMessageType } from "../../Messages/C2SMessageType";
import { JamMode, Status } from "../../Sensors/Jammer/JammerRelatedEnums";
import CreateJammerPanel from "../CreateJammerPanel/CreateJammerPanel";
import { JammersManager } from "../Manager/JammerManager";

interface Props {
  onClose: () => void;
  viewerRef: React.RefObject<any>;
}

export default function JammersPanel({ onClose, viewerRef }: Props) {
  const { send } = useWebSocket();
  const jammersManager = JammersManager.getInstance();

  const [jammers, setJammers] = useState<Jammer[]>(jammersManager.getAllJammers());
  const [selectedJammer, setSelectedJammer] = useState<Jammer | null>(null);
  // create / edit scenario panel
  const [showCreateJammerPanel, setShowCreateJammerPanel] = useState(false);
  const openCreateJammerPanel = () => setShowCreateJammerPanel(true);
  const [onSaveJammer, setOnSaveJammer] = useState<((data: Jammer) => void) | null>(null);
  
  
  const onCancel = () => {
    setShowCreateJammerPanel(false)
    setSelectedJammer(null);
  }

  useEffect(() => {
      const unsubscribe = jammersManager.subscribe((newJammers: Jammer[]) => {
          setJammers(newJammers);
      });
  
      return () => unsubscribe();
      }, [jammersManager]);



  const handleSelect = (jammer: Jammer) => {
    setSelectedJammer(jammer);
  };

  

  const handleAddJammerClick = () => {
    const newJammer: Jammer = {
      id: "",
      position: { latitude: 0, longitude: 0, altitude: 0 },
      status: Status.Online,
      jamMode: JamMode.None, 
      supportedFrequencies: [],
      radius: 200,
    };
    setSelectedJammer(newJammer);
    setOnSaveJammer(() => AddJammer); // set the onSave to Save function
    openCreateJammerPanel();

  };
  const AddJammer = (data: Jammer) => {
        send(C2SMessageType.AddJammer, data);
        setShowCreateJammerPanel(false);
        setSelectedJammer(null);
    };

    

    // On Edit
    const handleEditJammerClick = () => {
        setSelectedJammer(selectedJammer);
        setOnSaveJammer(() => EditJammer); // set the onSave to Edit function
        openCreateJammerPanel();
    };
    const EditJammer = (data: Jammer) => {
            send(C2SMessageType.EditJammer, data);
            setShowCreateJammerPanel(false);
            setSelectedJammer(null);
    };

    // On Remove
    const handleRemoveJammerClick = () => {
        send(C2SMessageType.RemoveJammer, selectedJammer);
        setSelectedJammer(null);
    };
    


  return (
    <>
        {/* if not showing create trajectory panel, show the Scenarios default panel */}
    { !showCreateJammerPanel && (
    <div className="jammer-panel">
      <h1 className="jammersTitle">Jammers</h1>

      <button className="addJammer-button" onClick={handleAddJammerClick}>
        Add Jammer
      </button>

      <div className="button-row">
        <button
          className="edit"
          onClick={handleEditJammerClick}
          disabled={!selectedJammer}
        >
          Edit
        </button>

        <button
          className="remove"
          onClick={handleRemoveJammerClick}
          disabled={!selectedJammer}
        >
          Remove
        </button>
      </div>

      {jammers.length === 0 && <p>No jammers yet.</p>}

      <ul className="jammer-list">
        {jammers.map(jammer => (
          <li
            key={jammer.id}
            className={`jammer-item ${
              selectedJammer?.id === jammer.id ? "selected" : ""
            }`}
            onClick={() => handleSelect(jammer)}
          >
            {jammer.id || "<unnamed jammer>"}
          </li>
        ))}
      </ul>

      <button onClick={onClose} className="close-button">
        Close
      </button>
    </div>
    )}

    {showCreateJammerPanel && (
                <CreateJammerPanel 
                initialJammer={selectedJammer!}
                onSave={onSaveJammer!}
                onCancel={onCancel}
                viewerRef={viewerRef}
                />
            )}

    </>
    
  );
}
