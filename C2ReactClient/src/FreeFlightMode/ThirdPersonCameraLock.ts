import * as Cesium from "cesium";

type CameraLockProps = {
  viewer: Cesium.Viewer;
  target: Cesium.Entity;
  distance?: number; // Distance in the local frame (X axis)
  baseHeight?: number; // Height in the local frame (Z axis)
};

export function initThirdPersonCameraLock({
  viewer,
  target: drone,
  distance = 80,
  baseHeight = 80,
}: CameraLockProps) {
  let active = true;

  // --- Define the desired offset in the local coordinate system (Local Frame) ---
  // Camera position in the local frame:
  // X = -distance (behind the drone)
  // Y = 0 (centered)
  // Z = baseHeight (above)
  const baseOffset = new Cesium.Cartesian3(-distance, 0, baseHeight);

  // --- 180-degree rotation (PI radians) around the local Z axis ---
  // Rotation matrix that creates a 180-degree offset.
  // We use Z (UP) as the rotation axis to perform a horizontal flip.
  const flipRotation = Cesium.Matrix3.fromRotationZ(Cesium.Math.PI);

  // --- Temporary variables ---
  const scratchCameraLocalOffset = new Cesium.Cartesian3();
  const scratchTransform = new Cesium.Matrix4();
  const scratchFinalTransform = new Cesium.Matrix4();
  
  const tickHandler = (_scene: Cesium.Scene, time: Cesium.JulianDate) => {
    if (!active || !drone.position || !drone.orientation) return;

    const dronePos = drone.position.getValue(time) as Cesium.Cartesian3;
    const quat = drone.orientation.getValue(time) as Cesium.Quaternion;

    if (!dronePos || !quat) return;

    // 1. Create the drone's global transformation matrix
    // This transformation converts from the drone's local frame to the world frame (EN-U).
    Cesium.Matrix4.fromRotationTranslation(
        Cesium.Matrix3.fromQuaternion(quat),
        dronePos,
        scratchTransform
    );

    // 2. Calculate the rotated local offset
    // Multiply the base offset by the 180-degree rotation matrix.
    // This *positions* the camera at a different point in the local frame.
    Cesium.Matrix3.multiplyByVector(
        flipRotation,
        baseOffset,
        scratchCameraLocalOffset // Copy the result
    );
    
    // 3. Use lookAtTransform with the rotated offset
    // The best method to follow an object with changing orientation.
    // The function positions the camera based on scratchCameraLocalOffset
    // (which already contains the 180-degree rotation) and points it at the drone.
    viewer.camera.lookAtTransform(
        scratchTransform,
        baseOffset // Use the base offset again, since lookAtTransform treats it as the position
    );
    
    // --- Using lookAtTransform with a composite matrix (alternative) ---
    // This is a cleaner way to ensure the full rotation: create a new transformation
    // that combines the drone's transformation with the camera's local rotation.
    // Cesium.Matrix4.multiply(scratchTransform, Cesium.Matrix4.fromRotation(flipRotation), scratchFinalTransform);
    // viewer.camera.lookAtTransform(
    //     scratchFinalTransform,
    //     baseOffset 
    // );
    
    // --- The cleanest solution ---
    // Actually, the simplest and most stable solution is to just use the *same* offset,
    // but **invert** the X direction, i.e., place the camera **in front of** the drone
    // if the intention is a "180-degree offset".
    // If the goal is simply to look backward at a fixed angle, then the Pitch should be changed.
    
    // Returning to the previous, stable solution, change the local offset once to include the 180-degree rotation
    viewer.camera.lookAtTransform(
        scratchTransform,
        new Cesium.Cartesian3(distance, 0, baseHeight) // Change X to positive - the camera moves from behind to in front by 180 degrees!
    );
  };

  // Add the tick handler
  viewer.clock.onTick.addEventListener(tickHandler);

  // Cleanup function
  return () => {
    active = false;
    viewer.clock.onTick.removeEventListener(tickHandler);
  };
}