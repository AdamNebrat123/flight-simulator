import * as Cesium from "cesium";

type CameraLockProps = {
  viewer: Cesium.Viewer;
  target: Cesium.Entity; // ה־Entity של הרחפן
  distance?: number;     // מרחק אחורי במישור האופקי
  baseHeight?: number;   // גובה בסיסי מעל הרחפן
};

export function initCameraLock({
  viewer,
  target: drone,
  distance = 50,
  baseHeight = 50,
}: CameraLockProps) {
  const tickHandler = (_scene: Cesium.Scene, time: Cesium.JulianDate) => {
    if (!drone.position || !drone.orientation) return;

    const dronePos = drone.position.getValue(time) as Cesium.Cartesian3;
    const droneQuat = drone.orientation.getValue(time) as Cesium.Quaternion;
    if (!dronePos || !droneQuat) return;

    // חלץ Heading & Pitch מתוך ה־Quaternion
    const hpr = Cesium.HeadingPitchRoll.fromQuaternion(droneQuat);
    const modelHeadingOffset = Cesium.Math.toRadians(35); // fix model axis mismatch
    const heading = hpr.heading + modelHeadingOffset;
    const pitch = Cesium.Math.toRadians(hpr.pitch) + Cesium.Math.toRadians(-35);
    const range = Math.sqrt(distance * distance + baseHeight * baseHeight);
    viewer.camera.lookAt(
        dronePos,
        new Cesium.HeadingPitchRange(
        heading,   // follow drone orientation
        pitch,     // look slightly downward
        range      // distance from the drone
        )
    );
    
  };

  viewer.clock.onTick.addEventListener(tickHandler);

  return () => {
    viewer.clock.onTick.removeEventListener(tickHandler);
  };
}
