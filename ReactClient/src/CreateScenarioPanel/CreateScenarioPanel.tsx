import { useState } from "react";

import "./CreateScenarioPanel.css";
import type { AircraftTrajectory, Scenario, Zone } from "../Messages/AllTypes";
import CreateTrajectoryPanel from "../CreateTrajectoryPanel/CreateTrajectoryPanel";
import ZonesPanel from "../ZonesPanel/ZonesPanel";
import JammersPanel from "../Jamming/JammersPanel/JammersPanel";
import { TemporaryZoneEntityManager } from "../Zones/TemporaryZoneEntityManager";
import { TemporaryJammerEntityManager } from "../Jamming/EntitiesManagment/TemporaryJammerEntityManager";
import type { Sensor } from "../Sensors/Sensor";

interface Props {
  onClose: () => void;
  onSave: (scenario: Scenario) => void;
  initialScenario?: Scenario
  viewerRef: React.RefObject<any>;
}

export default function CreateScenarioPanel({ onClose, onSave, initialScenario, viewerRef }: Props) {
  const [selectedTab, setSelectedTab] = useState<"TRAJECTORIES" | "ZONES" | "JAMMERS">("TRAJECTORIES");

  const [scenarioName, setScenarioName] = useState(initialScenario?.scenarioName || "");
  const [aircrafts, setAircrafts] = useState<AircraftTrajectory[]>(initialScenario?.aircrafts || []);
  const [zones, setZones] = useState<Zone[]>(initialScenario?.zones || []);
  const [jammers, setJammers] = useState<Sensor[]>(initialScenario?.jammers || []);
  const temporaryZoneEntityManager = TemporaryZoneEntityManager.GetInstance(viewerRef.current);
  const temporaryJammerEntityManager = TemporaryJammerEntityManager.GetInstance(viewerRef.current!);

  const handleSave = () => {
    onSave({ scenarioName, aircrafts, zones, jammers, radars: [], scenarioId : ""});
    handleCancel();
  };
  const handleCancel = () => {
    temporaryZoneEntityManager.clearAllZones()
    temporaryJammerEntityManager.clearAllJammers()
    onClose();
  };

  return (
    <div className="create-scenario-panel">
      {/* Header: Scenario Name + Save/Cancel */}
      <div className="scenario-header">
        <input
          type="text"
          placeholder="Scenario Name"
          className="scenario-name-input"
          value={scenarioName}
          onChange={(e) => setScenarioName(e.target.value)}
        />
        <div className="scenario-actions">
          <button className="save-button" onClick={handleSave}>Save</button>
          <button className="cancel-button" onClick={handleCancel}>Cancel</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="scenario-tabs">
        <div
          className={`tab ${selectedTab === "TRAJECTORIES" ? "selected" : ""}`}
          onClick={() => setSelectedTab("TRAJECTORIES")}
        >
          TRAJECTORIES
        </div>
        <div
          className={`tab ${selectedTab === "ZONES" ? "selected" : ""}`}
          onClick={() => setSelectedTab("ZONES")}
        >
          ZONES
        </div>
        <div
          className={`tab ${selectedTab === "JAMMERS" ? "selected" : ""}`}
          onClick={() => setSelectedTab("JAMMERS")}
        >
          JAMMERS
        </div>
      </div>

      {/* Tab content */}
      <div className="scenario-content">
        {selectedTab === "TRAJECTORIES" && (
          <CreateTrajectoryPanel
            aircrafts={aircrafts}
            setAircrafts={setAircrafts}
            viewerRef={viewerRef}
          />
        )}
        {selectedTab === "ZONES" && (
          <ZonesPanel
            zones={zones}
            setZones={setZones}
            viewerRef={viewerRef}
          />
        )}
        {selectedTab === "JAMMERS" && (
          <JammersPanel
            zones={zones}
            jammers={jammers}
            setJammers={setJammers}
            viewerRef={viewerRef}
          />
        )}
      </div>
    </div>
  );
}
