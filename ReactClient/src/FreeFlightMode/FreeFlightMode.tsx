import { useState, useRef, useEffect } from "react";
import * as Cesium from "cesium";
import FreeFlightModeViewer from "./FreeFlightModeViewer";
import { initDroneController } from "./DroneController";
import { initThirdPersonCameraLock } from "./ThirdPersonCameraLock";
import { initFirstPersonCameraLock } from "./FirstPersonCameraLock";
import { DroneHandler } from "./Drones/DroneHandler";
import { useWebSocket } from "../WebSocket/WebSocketProvider";
import { S2CMessageType } from "../Messages/S2CMessageType";
import { C2SMessageType } from "../Messages/C2SMessageType";
import type { Drone, TrajectoryPoint } from "../Messages/AllTypes";

export default function FreeFlightMode() {
  const [viewer, setViewer] = useState<Cesium.Viewer | null>(null);
  const droneRef = useRef<Cesium.Entity | null>(null);
  const cameraCleanupRef = useRef<(() => void) | null>(null);
  const controllerCleanupRef = useRef<(() => void) | null>(null);
  const [cameraMode, setCameraMode] = useState<"THIRD_PERSON" | "FIRST_PERSON">("THIRD_PERSON");
  const droneHandlerRef = useRef<DroneHandler | null>(null);
  const { send, on } = useWebSocket();

  // Initialize drone handler when viewer is ready
  useEffect(() => {
    if (!viewer) return;
    droneHandlerRef.current = DroneHandler.getInstance(viewer);

    // Send initial AddDrone request
    const initialDrone: Drone = {
      id: "", // temporary, server may assign proper id
      trajectoryPoint: {
        position: { longitude: 34.78217676812864, latitude: 32.02684069644974, altitude: 160 },
        heading: 0,
        pitch: 0,
      } as TrajectoryPoint,
    };
    send(C2SMessageType.AddDrone, initialDrone);
  }, [viewer]);

  // Register WebSocket handlers
  useEffect(() => {
    if (!droneHandlerRef.current || !viewer) return;

    const handleAddDrone = (data: any) => {
      droneHandlerRef.current?.HandleAddDrone(data);
      const entity = droneHandlerRef.current?.getDroneEntity(data.id ?? data.droneId);
      if (entity) {
        droneRef.current = entity;

        // Cleanup previous controller if exists
        controllerCleanupRef.current?.();

        // Initialize controller
        controllerCleanupRef.current = initDroneController({
          viewer,
          send,
          drone: entity,
          maxSpeed: 100,
          acceleration: 80,
        });

        // Initialize default camera
        cameraCleanupRef.current?.();
        cameraCleanupRef.current = initThirdPersonCameraLock({
          viewer,
          target: entity,
          distance: 80,
          baseHeight: 80,
        });
      }
    };

    const handleRemoveDrone = (data: any) => {
      droneHandlerRef.current?.HandleRemoveDrone(data);

      if (droneRef.current?.id === (data.id ?? data.droneId)) {
        // Cleanup controller and camera
        controllerCleanupRef.current?.();
        cameraCleanupRef.current?.();
        droneRef.current = null;
      }
    };

    const handleUpdateDrone = (data: any) => {
      droneHandlerRef.current?.HandleUpdateDrone(data);
    };

    const handleDroneError = (data: any) => {
      droneHandlerRef.current?.HandleDroneError(data);
    };

    const unsubAddDrone = on(S2CMessageType.AddDrone, handleAddDrone);
    const unsubRemoveDrone = on(S2CMessageType.RemoveDrone, handleRemoveDrone);
    const unsubUpdateDrone = on(S2CMessageType.UpdateDrone, handleUpdateDrone);
    const unsubDroneError = on(S2CMessageType.DroneError, handleDroneError);

    return () => {
      unsubAddDrone();
      unsubRemoveDrone();
      unsubUpdateDrone();
      unsubDroneError();
    };
  }, [viewer, droneHandlerRef.current]);

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

      <button
        onClick={(e) => {
          e.preventDefault();
          toggleCameraMode();
          (e.currentTarget as HTMLButtonElement).blur();
        }}
        tabIndex={-1}
        style={{ position: "absolute", top: 10, left: 10, zIndex: 1000, padding: "10px 20px", cursor: "pointer" }}
      >
        {cameraMode === "THIRD_PERSON"
          ? "Switch to First-Person"
          : "Switch to Third-Person"}
      </button>
    </div>
  );
}
