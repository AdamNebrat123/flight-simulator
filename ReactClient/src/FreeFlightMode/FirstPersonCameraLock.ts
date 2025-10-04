import * as Cesium from "cesium";

type FirstPersonCameraProps = {
  viewer: Cesium.Viewer;
  target: Cesium.Entity;
  headingOffset?: number;   // Optional additional rotation
  forwardOffset?: number;   // Distance forward from the drone's position
  upOffset?: number;        // Height above the drone
};

export function initFirstPersonCameraLock({
  viewer,
  target: drone,
  forwardOffset = 1.6, // How many meters forward to place the camera (inside the drone)
  upOffset = 0,        // Height above the drone
  headingOffset = 0    // Optional - additional rotation
}: FirstPersonCameraProps) {
  let active = true;

  // Rotation matrix of 180 degrees around Z axis (heading correction)
  const headingCorrection = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(180 + headingOffset));

  // Temporary variables for reuse
  const scratchMatrix3 = new Cesium.Matrix3();
  const scratchDirection = new Cesium.Cartesian3();
  const scratchUp = new Cesium.Cartesian3();
  const scratchPosition = new Cesium.Cartesian3();
  const offset = new Cesium.Cartesian3();

  const tickHandler = (_scene: Cesium.Scene, time: Cesium.JulianDate) => {
    if (!active || !drone.position || !drone.orientation) return;

    const dronePos = drone.position.getValue(time, scratchPosition);
    const droneQuat = drone.orientation.getValue(time);
    if (!dronePos || !droneQuat) return;

    // Get rotation matrix from orientation
    Cesium.Matrix3.fromQuaternion(droneQuat, scratchMatrix3);

    // Apply heading correction of 180 degrees
    Cesium.Matrix3.multiply(scratchMatrix3, headingCorrection, scratchMatrix3);

    // Forward axis (X) from transformation
    const forward = Cesium.Matrix3.getColumn(scratchMatrix3, 0, scratchDirection);
    Cesium.Cartesian3.normalize(forward, forward);

    // Up axis (Z) from transformation
    const up = Cesium.Matrix3.getColumn(scratchMatrix3, 2, scratchUp);
    Cesium.Cartesian3.normalize(up, up);

    // Camera position = drone position + forward * offset + up * offset
    Cesium.Cartesian3.multiplyByScalar(forward, forwardOffset, offset);
    Cesium.Cartesian3.add(dronePos, offset, offset);

    Cesium.Cartesian3.multiplyByScalar(up, upOffset, scratchUp);
    Cesium.Cartesian3.add(offset, scratchUp, offset);

    // Update camera with setView
    viewer.camera.setView({
      destination: offset,
      orientation: {
        direction: forward,
        up: up
      }
    });
  };

  viewer.clock.onTick.addEventListener(tickHandler);

  return () => {
    active = false;
    viewer.clock.onTick.removeEventListener(tickHandler);
  };
}
