import { useState } from "react";

import "./CreateScenarioPanel.css";
import type { AircraftTrajectory, Zone } from "../Messages/AllTypes";
import type { Jammer } from "../Sensors/Jammer/Jammer";
import CreateTrajectoryPanel from "../CreateTrajectoryPanel/CreateTrajectoryPanel";
import ZonesPanel from "../ZonesPanel/ZonesPanel";
import JammersPanel from "../Jamming/JammersPanel/JammersPanel";

interface Props {
  onClose: () => void;
  onSave: (scenarioData: {
    scenarioName: string;
    aircrafts: AircraftTrajectory[];
    zones: Zone[];
    jammers: Jammer[];
  }) => void;
  initialScenario?: {
    scenarioName: string;
    aircrafts: AircraftTrajectory[];
    zones: Zone[];
    jammers: Jammer[];
  };
  viewerRef: React.RefObject<any>;
}

export default function CreateScenarioPanel({ onClose, onSave, initialScenario, viewerRef }: Props) {
  const [selectedTab, setSelectedTab] = useState<"TRAJECTORIES" | "ZONES" | "JAMMERS">("TRAJECTORIES");

  const [scenarioName, setScenarioName] = useState(initialScenario?.scenarioName || "");
  const [aircrafts, setAircrafts] = useState<AircraftTrajectory[]>(initialScenario?.aircrafts || []);
  const [zones, setZones] = useState<Zone[]>(initialScenario?.zones || []);
  const [jammers, setJammers] = useState<Jammer[]>(initialScenario?.jammers || []);

  const handleSave = () => {
    onSave({ scenarioName, aircrafts, zones, jammers });
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
          <button className="cancel-button" onClick={onClose}>Cancel</button>
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
            viewerRef={viewerRef}
            initialScenario={{ aircrafts: [], scenarioName: "ScenarioName", scenarioId: "" , zones:[], radars: [], jammers: []}}
            //trajectories={aircrafts}
            //setTrajectories={setAircrafts}
          />
        )}
        {selectedTab === "ZONES" && (
          <ZonesPanel
            viewerRef={viewerRef}
            //zones={zones}
            //setZones={setZones}
          />
        )}
        {selectedTab === "JAMMERS" && (
          <JammersPanel
            viewerRef={viewerRef}
            onClose={() => {}}
            //jammers={jammers}
            //setJammers={setJammers}
          />
        )}
      </div>
    </div>
  );
}
