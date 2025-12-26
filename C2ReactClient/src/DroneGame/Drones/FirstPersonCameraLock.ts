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
  forwardOffset = 1.6,
  upOffset = 0,
  headingOffset = 0
}: FirstPersonCameraProps) {
  let active = true;

  const headingCorrection = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(180 + headingOffset));

  const scratchMatrix3 = new Cesium.Matrix3();
  const scratchForward = new Cesium.Cartesian3();
  const scratchUp = new Cesium.Cartesian3();
  const scratchPosition = new Cesium.Cartesian3();
  const cameraPos = new Cesium.Cartesian3();
  const rightVec = new Cesium.Cartesian3();
  const worldUp = Cesium.Cartesian3.UNIT_Z;

  const tickHandler = (_scene: Cesium.Scene, time: Cesium.JulianDate) => {
    if (!active || !drone.position || !drone.orientation) return;

    const dronePos = drone.position.getValue(time, scratchPosition);
    const droneQuat = drone.orientation.getValue(time);
    if (!dronePos || !droneQuat) return;

    // Rotation matrix from quaternion
    Cesium.Matrix3.fromQuaternion(droneQuat, scratchMatrix3);

    // Apply heading correction
    Cesium.Matrix3.multiply(scratchMatrix3, headingCorrection, scratchMatrix3);

    // Forward (X axis)
    Cesium.Matrix3.getColumn(scratchMatrix3, 0, scratchForward);
    Cesium.Cartesian3.normalize(scratchForward, scratchForward);

    // Up (Z axis)
    Cesium.Matrix3.getColumn(scratchMatrix3, 2, scratchUp);
    Cesium.Cartesian3.normalize(scratchUp, scratchUp);

    // ===== Orthogonalization with singularity fix =====
    const forwardDotUp = Cesium.Cartesian3.dot(scratchForward, worldUp);

    if (Math.abs(forwardDotUp) > 0.99) {
      // Forward almost parallel to world up → avoid flip
      Cesium.Cartesian3.clone(worldUp, scratchUp);
    } else {
      // Normal case: make right vector and recompute orthogonal up
      Cesium.Cartesian3.cross(scratchForward, scratchUp, rightVec);
      Cesium.Cartesian3.normalize(rightVec, rightVec);
      Cesium.Cartesian3.cross(rightVec, scratchForward, scratchUp);
      Cesium.Cartesian3.normalize(scratchUp, scratchUp);
    }

    // ===== Camera position =====
    Cesium.Cartesian3.multiplyByScalar(scratchForward, forwardOffset, cameraPos);
    Cesium.Cartesian3.add(dronePos, cameraPos, cameraPos);

    const upOffsetVec = new Cesium.Cartesian3();
    Cesium.Cartesian3.multiplyByScalar(scratchUp, upOffset, upOffsetVec);
    Cesium.Cartesian3.add(cameraPos, upOffsetVec, cameraPos);

    // Set camera view
    viewer.camera.setView({
      destination: cameraPos,
      orientation: {
        direction: scratchForward,
        up: scratchUp
      }
    });
  };

  viewer.clock.onTick.addEventListener(tickHandler);

  return () => {
    active = false;
    viewer.clock.onTick.removeEventListener(tickHandler);
  };
}
