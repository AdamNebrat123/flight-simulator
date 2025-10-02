import { useState, useRef, useEffect } from "react";
import * as Cesium from "cesium";
import FreeFlightModeViewer from "./FreeFlightModeViewer";
import DroneEntity from "./DroneEntity";
import { initDroneController } from "./DroneController"; 
import { initCameraLock } from "./CameraLock";

export default function FreeFlightMode() {
  const [viewer, setViewer] = useState<Cesium.Viewer | null>(null);
  const droneRef = useRef<Cesium.Entity | null>(null);

  useEffect(() => {
    if (!viewer || !droneRef.current) return;

    // Initialize the drone controller
    const cleanup = initDroneController({
        viewer,
        drone: droneRef.current,
        maxSpeed: 50,      // max speed in meters/sec
        acceleration: 20,  // acceleration in meters/sec^2
    });
    // Initialize the camera lock (third-person view)
    const cleanupCamera = initCameraLock({
      viewer,
      target: droneRef.current,
      distance: 50, // distance from the drone
      baseHeight: 50,    // height above the drone
    });

    // Cleanup function when unmounting or viewer/drone changes
    return () => {
      cleanup(); // removes tick listener and keyboard events
      cleanupCamera(); // removes camera lock
    };
  }, [viewer, droneRef.current]);

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
