import { useState, useRef, useEffect } from "react";
import * as Cesium from "cesium";
import FreeFlightModeViewer from "./FreeFlightModeViewer";
import DroneEntity from "./DroneEntity";
import { initDroneController } from "./DroneController";
import { initThirdPersonCameraLock } from "./ThirdPersonCameraLock";
import { initFirstPersonCameraLock } from "./FirstPersonCameraLock";
import { DroneHandler } from "./Drones/DroneHandler";
import { useWebSocket } from "../WebSocket/WebSocketProvider";
import { S2CMessageType } from "../Messages/S2CMessageType";

export default function FreeFlightMode() {
  const [viewer, setViewer] = useState<Cesium.Viewer | null>(null);
  const droneRef = useRef<Cesium.Entity | null>(null);
  const cameraCleanupRef = useRef<(() => void) | null>(null);
  const [cameraMode, setCameraMode] = useState<"THIRD_PERSON" | "FIRST_PERSON">("THIRD_PERSON");
  const droneHandlerRef = useRef<DroneHandler | null>(null);

  const { on } = useWebSocket();

  // Initialize drone handler when viewer is ready
  useEffect(() => {
    if (!viewer) return;
    droneHandlerRef.current = DroneHandler.getInstance(viewer);
  }, [viewer]);

  // Register WebSocket handlers for Drone messages
  useEffect(() => {
    if (!droneHandlerRef.current) return;

    const unsubAddDrone = on(S2CMessageType.AddDrone, (data) => {
      droneHandlerRef.current?.HandleAddDrone(data);
    });

    const unsubRemoveDrone = on(S2CMessageType.RemoveDrone, (data) => {
      droneHandlerRef.current?.HandleRemoveDrone(data);
    });

    const unsubUpdateDrone = on(S2CMessageType.UpdateDrone, (data) => {
      droneHandlerRef.current?.HandleUpdateDrone(data);
    });

    const unsubDroneError = on(S2CMessageType.DroneError, (data) => {
      droneHandlerRef.current?.HandleDroneError(data);
    });

    return () => {
      unsubAddDrone();
      unsubRemoveDrone();
      unsubUpdateDrone();
      unsubDroneError();
    };
  }, [droneHandlerRef.current]);

  // Initialize drone and controller
  useEffect(() => {
    if (!viewer || !droneRef.current) return;

    const cleanupController = initDroneController({
      viewer,
      drone: droneRef.current,
      maxSpeed: 100,
      acceleration: 80,
    });

    // Default initialization - Third-Person
    cameraCleanupRef.current = initThirdPersonCameraLock({
      viewer,
      target: droneRef.current,
    });

    return () => {
      cleanupController();
      cameraCleanupRef.current?.();
    };
  }, [viewer, droneRef.current]);

  const toggleCameraMode = () => {
    if (!viewer || !droneRef.current) return;

    cameraCleanupRef.current?.();

    if (cameraMode === "THIRD_PERSON") {
      cameraCleanupRef.current = initFirstPersonCameraLock({
        viewer,
        target: droneRef.current,
        forwardOffset: -5,
      });
      setCameraMode("FIRST_PERSON");
    } else {
      cameraCleanupRef.current = initThirdPersonCameraLock({
        viewer,
        target: droneRef.current,
        distance: 80,
        baseHeight: 80,
      });
      setCameraMode("THIRD_PERSON");
    }
  };

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <FreeFlightModeViewer onViewerReady={setViewer} />

      {viewer && (
        <DroneEntity
          viewer={viewer}
          onReady={(entity) => (droneRef.current = entity)}
        />
      )}

      <button
        onClick={(e) => {
          e.preventDefault();
          toggleCameraMode();
          (e.currentTarget as HTMLButtonElement).blur();
        }}
        tabIndex={-1}
        style={{ position: "absolute", top: 10, left: 10, zIndex: 1000, padding: "10px 20px", cursor: "pointer"}}
      >
        {cameraMode === "THIRD_PERSON"
          ? "Switch to First-Person"
          : "Switch to Third-Person"}
      </button>
    </div>
  );
}
