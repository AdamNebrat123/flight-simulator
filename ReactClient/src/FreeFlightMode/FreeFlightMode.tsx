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

export default function FreeFlightMode() {
  const [viewer, setViewer] = useState<Cesium.Viewer | null>(null);
  const droneRef = useRef<Cesium.Entity | null>(null);
  const cameraCleanupRef = useRef<(() => void) | null>(null);
  const controllerCleanupRef = useRef<(() => void) | null>(null);
  const [cameraMode, setCameraMode] = useState<"THIRD_PERSON" | "FIRST_PERSON">("THIRD_PERSON");
  const droneHandlerRef = useRef<DroneHandler | null>(null);
  const { send, on } = useWebSocket();

  // Initialize DroneHandler when viewer is ready and request initial drone data
  useEffect(() => {
    if (!viewer) return;

    droneHandlerRef.current = DroneHandler.getInstance(viewer);
    send(C2SMessageType.RequestDroneInitData, {});
  }, [viewer]);

  // Setup my drone: controller + camera
  const setupMyDrone = (entity: Cesium.Entity) => {
    droneRef.current = entity;

    controllerCleanupRef.current?.();
    cameraCleanupRef.current?.();

    controllerCleanupRef.current = initDroneController({
      viewer: viewer!,
      send,
      drone: entity,
      maxSpeed: 50,
      acceleration: 40,
    });
    setCameraMode("THIRD_PERSON");
    cameraCleanupRef.current = initThirdPersonCameraLock({
      viewer: viewer!,
      target: entity,
      distance: 80,
      baseHeight: 40,
    });
  };

  // WebSocket handlers
  useEffect(() => {
    if (!droneHandlerRef.current || !viewer) return;

    const handleDroneInitData = (data: any) => {
      const myDroneId = droneHandlerRef.current?.HandleDronesInitData(data);
      if (!myDroneId) return;

      if (!droneRef.current) {
        const entity = droneHandlerRef.current?.getDroneEntity(myDroneId);
        if (entity) setupMyDrone(entity);
      }
    };

    const handleRemoveDrone = (data: any) => {
      droneHandlerRef.current?.HandleRemoveDrone(data);
    };

    const handleUpdateDrone = (data: any) => {
      droneHandlerRef.current?.HandleUpdateDrone(data);
    };

    const handleDroneError = (data: any) => {
      droneHandlerRef.current?.HandleDroneError(data);
    };

    const unsubInit = on(S2CMessageType.DroneInitData, handleDroneInitData);
    const unsubRemoveDrone = on(S2CMessageType.RemoveDrone, handleRemoveDrone);
    const unsubUpdateDrone = on(S2CMessageType.UpdateDrone, handleUpdateDrone);
    const unsubDroneError = on(S2CMessageType.DroneError, handleDroneError);

    return () => {
      unsubInit();
      unsubRemoveDrone();
      unsubUpdateDrone();
      unsubDroneError();
    };
  }, [viewer, droneHandlerRef.current]);

  // Camera toggle
  const toggleCameraMode = () => {
    if (!viewer || !droneRef.current) return;

    cameraCleanupRef.current?.();

    if (cameraMode === "THIRD_PERSON") {
      cameraCleanupRef.current = initFirstPersonCameraLock({
        viewer,
        target: droneRef.current,
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

  // Cleanup on component unmount
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (droneRef.current) {
        send(C2SMessageType.RemoveDrone, { id: droneRef.current.id });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      // Send REMOVE for my drone
      if (droneRef.current) {
        send(C2SMessageType.RemoveDrone, { id: droneRef.current.id });
      }

      // Cleanup controller & camera
      controllerCleanupRef.current?.();
      cameraCleanupRef.current?.();
      droneRef.current = null;

      // Cleanup drone handler
      droneHandlerRef.current?.clearAllDrones();
      droneHandlerRef.current = null;

      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

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
