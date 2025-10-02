import * as Cesium from "cesium";
import { DroneOrientationManager } from "./DroneOrientationManager";

type CameraLockProps = {
  viewer: Cesium.Viewer;
  target: Cesium.Entity;
  distance?: number; // Distance behind 
  baseHeight?: number; // Distance above
  headingOffset?: number;
};

export function initThirdPersonCameraLock({
  viewer,
  target: drone,
  distance = 80,
  baseHeight = 80,
  headingOffset = Cesium.Math.toRadians(0),
}: CameraLockProps) {
  // Manager to handle drone orientation
  const orientationManager = new DroneOrientationManager(drone, headingOffset);
  let active = true;

  const tickHandler = (_scene: Cesium.Scene, time: Cesium.JulianDate) => {
    if (!active || !drone.position || !drone.orientation) return;

    // Get current drone position
    const dronePos = drone.position.getValue(time) as Cesium.Cartesian3;
    if (!dronePos) return;

    // Compute model heading with offset
    const modelHeading = orientationManager.getHeading(dronePos) + Cesium.Math.toRadians(-55);
    // Set fixed camera pitch
    const pitch = Cesium.Math.toRadians(-35);
    // Compute distance from drone for camera
    const range = Math.sqrt(distance * distance + baseHeight * baseHeight);

    // Set the camera to look at the drone from third-person perspective
    viewer.camera.lookAt(
      dronePos,
      new Cesium.HeadingPitchRange(modelHeading, pitch, range)
    );
  };

  // Add tick handler to update camera every frame
  viewer.clock.onTick.addEventListener(tickHandler);

  // Return cleanup function to stop updating the camera
  return () => {
    active = false;
    viewer.clock.onTick.removeEventListener(tickHandler);
  };
}
