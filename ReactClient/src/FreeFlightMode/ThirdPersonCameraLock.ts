import * as Cesium from "cesium";

type CameraLockProps = {
  viewer: Cesium.Viewer;
  target: Cesium.Entity;
  distance?: number; // Distance in local frame (X axis)
  baseHeight?: number; // Height in local frame (Z axis)
};

export function initThirdPersonCameraLock({
  viewer,
  target: drone,
  distance = 80,
  baseHeight = 80,
}: CameraLockProps) {
  let active = true;

  // --- Define desired offset in the local frame ---
  // Camera position in local frame:
  // X = -distance (behind the drone)
  // Y = 0 (center)
  // Z = baseHeight (up)
  const baseOffset = new Cesium.Cartesian3(-distance, 0, baseHeight);

  // --- 180 degrees rotation (pi radians) around local Z axis ---
  // Rotation matrix that flips by 180 degrees.
  // We use Z (UP) as rotation axis to perform a horizontal flip.
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

    // 1. Create global transformation matrix of the drone
    // This transformation converts from the drone's local frame to the global (ENU) frame.
    Cesium.Matrix4.fromRotationTranslation(
        Cesium.Matrix3.fromQuaternion(quat),
        dronePos,
        scratchTransform
    );

    // 2. Calculate rotated local offset
    // Multiply the base offset by the 180-degree rotation matrix.
    // This positions the camera differently in the local frame.
    Cesium.Matrix3.multiplyByVector(
        flipRotation,
        baseOffset,
        scratchCameraLocalOffset // store result
    );
    
    // 3. Use lookAtTransform with the rotated offset
    // Best method to follow an object with changing orientation.
    // The function places the camera at the position computed from scratchCameraLocalOffset
    // (already includes the 180-degree rotation) and points it at the drone.
    viewer.camera.lookAtTransform(
        scratchTransform,
        baseOffset // using the base offset again, as lookAtTransform references it as the target position
    );
    
    // --- Using lookAtTransform with a composite matrix (alternative) ---
    // A cleaner way to ensure full rotation: create a new transformation
    // that combines the drone's transform with the camera's local rotation.
    // Cesium.Matrix4.multiply(scratchTransform, Cesium.Matrix4.fromRotation(flipRotation), scratchFinalTransform);
    // viewer.camera.lookAtTransform(
    //     scratchFinalTransform,
    //     baseOffset 
    // );
    
    // --- Cleanest solution ---
    // Actually, the simplest and most stable solution is just to use the *same* offset, 
    // but **flip** the X direction, i.e., place the camera **in front** of the drone
    // if this is the intention of "180 degrees flip". 
    // If the goal is simply to look backward at a fixed angle, adjust the pitch instead.
    
    // Reverting to the previous stable solution, update local offset once to include 180-degree flip
    viewer.camera.lookAtTransform(
        scratchTransform,
        new Cesium.Cartesian3(distance, 0, baseHeight) // X flipped to positive - camera moved in front!
    );
  };

  // Add tick handler
  viewer.clock.onTick.addEventListener(tickHandler);

  // Cleanup function
  return () => {
    active = false;
    viewer.clock.onTick.removeEventListener(tickHandler);
  };
}
