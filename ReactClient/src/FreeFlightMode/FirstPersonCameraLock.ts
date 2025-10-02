import * as Cesium from "cesium";
import { DroneOrientationManager } from "./DroneOrientationManager";

type FirstPersonCameraProps = {
  viewer: Cesium.Viewer;
  target: Cesium.Entity;
  headingOffset?: number;
  forwardOffset?: number; // forward
  upOffset?: number;      // slightly above the drone's center
};

export function initFirstPersonCameraLock({
  viewer,
  target: drone,
  headingOffset = Cesium.Math.toRadians(-90),
  forwardOffset = 2,
  upOffset = 1,
}: FirstPersonCameraProps) {
  const orientationManager = new DroneOrientationManager(drone, headingOffset);
  let active = true;

  const tickHandler = (_scene: Cesium.Scene, time: Cesium.JulianDate) => {
    if (!active || !drone.position || !drone.orientation) return;

    const dronePos = drone.position.getValue(time) as Cesium.Cartesian3;
    const droneQuat = drone.orientation.getValue(time) as Cesium.Quaternion;
    if (!dronePos || !droneQuat) return;

    // Corrected heading
    const modelHeading = orientationManager.getHeading(dronePos);

    // Forward vector in world coordinates
    const forward = new Cesium.Cartesian3(1, 0, 0);
    const rotationMatrix = Cesium.Matrix3.fromQuaternion(droneQuat);
    const forwardWorld = new Cesium.Cartesian3();
    Cesium.Matrix3.multiplyByVector(rotationMatrix, forward, forwardWorld);

    // Up vector in world coordinates
    const up = new Cesium.Cartesian3(0, 0, 1);
    const upWorld = new Cesium.Cartesian3();
    Cesium.Matrix3.multiplyByVector(rotationMatrix, up, upWorld);

    // Calculate camera position
    const cameraPos = new Cesium.Cartesian3();
    Cesium.Cartesian3.multiplyByScalar(forwardWorld, forwardOffset, cameraPos);
    const upOffsetVec = new Cesium.Cartesian3();
    Cesium.Cartesian3.multiplyByScalar(upWorld, upOffset, upOffsetVec);
    Cesium.Cartesian3.add(cameraPos, upOffsetVec, cameraPos);
    Cesium.Cartesian3.add(cameraPos, dronePos, cameraPos);

    // Update the camera
    viewer.camera.setView({
      destination: cameraPos,
      orientation: {
        heading: modelHeading + Cesium.Math.toRadians(-55),
        pitch: 0,
        roll: 0,
      },
    });
  };

  viewer.clock.onTick.addEventListener(tickHandler);

  return () => {
    active = false;
    viewer.clock.onTick.removeEventListener(tickHandler);
  };
}
