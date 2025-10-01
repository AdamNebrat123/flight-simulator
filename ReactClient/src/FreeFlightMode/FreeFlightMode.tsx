import { useState, useRef } from "react";
import * as Cesium from "cesium";
import FreeFlightModeViewer from "./FreeFlightModeViewer";
import DroneEntity from "./DroneEntity";

export default function FreeFlightMode() {
  const [viewer, setViewer] = useState<Cesium.Viewer | null>(null);
  const droneRef = useRef<Cesium.Entity | null>(null);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      {/* Viewer */}
      <FreeFlightModeViewer onViewerReady={setViewer} />

      {/* Drone Entity */}
      {viewer && (
        <DroneEntity
          viewer={viewer}
          onReady={(entity) => (droneRef.current = entity)}
        />
      )}
    </div>
  );
}
