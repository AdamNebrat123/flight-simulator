import * as Cesium from "cesium";
import { DroneOrientationManager } from "./DroneOrientationManager";

type CameraLockProps = {
  viewer: Cesium.Viewer;
  target: Cesium.Entity;
  distance?: number;
  baseHeight?: number;
  headingOffset?: number;
};

export function initThirdPersonCameraLock({
  viewer,
  target: drone,
  distance = 80,
  baseHeight = 80,
  headingOffset = Cesium.Math.toRadians(0),
}: CameraLockProps) {
  const orientationManager = new DroneOrientationManager(drone, headingOffset);
  let active = true;

  const tickHandler = (_scene: Cesium.Scene, time: Cesium.JulianDate) => {
    if (!active || !drone.position || !drone.orientation) return;

    const dronePos = drone.position.getValue(time) as Cesium.Cartesian3;
    if (!dronePos) return;

    const modelHeading = orientationManager.getHeading(dronePos) + Cesium.Math.toRadians(-55);
    const pitch = Cesium.Math.toRadians(-35);
    const range = Math.sqrt(distance * distance + baseHeight * baseHeight);

    viewer.camera.lookAt(
      dronePos,
      new Cesium.HeadingPitchRange(modelHeading, pitch, range)
    );
  };

  viewer.clock.onTick.addEventListener(tickHandler);

  return () => {
    active = false;
    viewer.clock.onTick.removeEventListener(tickHandler);
  };
}
