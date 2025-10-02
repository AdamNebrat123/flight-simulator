import { useState, useRef, useEffect } from "react";
import * as Cesium from "cesium";
import FreeFlightModeViewer from "./FreeFlightModeViewer";
import DroneEntity from "./DroneEntity";
import { initDroneController } from "./DroneController";
import { initThirdPersonCameraLock } from "./ThirdPersonCameraLock";
import { initFirstPersonCameraLock } from "./FirstPersonCameraLock";

export default function FreeFlightMode() {
  const [viewer, setViewer] = useState<Cesium.Viewer | null>(null);
  const droneRef = useRef<Cesium.Entity | null>(null);
  const cameraCleanupRef = useRef<(() => void) | null>(null);
  const [cameraMode, setCameraMode] = useState<"THIRD_PERSON" | "FIRST_PERSON">("THIRD_PERSON");

  // אתחול רחפן וקונטרולר
  useEffect(() => {
    if (!viewer || !droneRef.current) return;

    const cleanupController = initDroneController({
      viewer,
      drone: droneRef.current,
      maxSpeed: 100,
      acceleration: 80,
    });

    // אתחול ברירת מחדל - Third-Person
    cameraCleanupRef.current = initThirdPersonCameraLock({
      viewer,
      target: droneRef.current,
    });

    return () => {
      cleanupController();
      cameraCleanupRef.current?.();
    };
  }, [viewer, droneRef.current]);

  // פונקציה להחלפת מצב מצלמה
  const toggleCameraMode = () => {
    if (!viewer || !droneRef.current) return;

    // הרס את המצלמה הנוכחית
    cameraCleanupRef.current?.();

    if (cameraMode === "THIRD_PERSON") {
      // הפעלת First-Person
      cameraCleanupRef.current = initFirstPersonCameraLock({
        viewer,
        target: droneRef.current,
        forwardOffset: -5, // ניתן לשנות אם רוצים להזיז את העיניים קדימה
      });
      setCameraMode("FIRST_PERSON");
    } else {
      // הפעלת Third-Person
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
      {/* Viewer */}
      <FreeFlightModeViewer onViewerReady={setViewer} />

      {/* Drone Entity */}
      {viewer && (
        <DroneEntity
          viewer={viewer}
          onReady={(entity) => (droneRef.current = entity)}
        />
      )}

      {/* כפתור להחלפת מצב מצלמה */}
      <button
        onClick={(e) => {
          e.preventDefault(); // מונע השפעת מקשים כמו space/enter
          toggleCameraMode();
          (e.currentTarget as HTMLButtonElement).blur(); // מונע שהכפתור יקבל focus
        }}
        tabIndex={-1} // מונע focus אוטומטי
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 1000,
          padding: "10px 20px",
          cursor: "pointer",
        }}
      >
        {cameraMode === "THIRD_PERSON"
          ? "Switch to First-Person"
          : "Switch to Third-Person"}
      </button>
    </div>
  );
}
