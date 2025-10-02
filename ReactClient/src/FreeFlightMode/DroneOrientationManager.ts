import * as Cesium from "cesium";

/**
 * מנהל האוריינטציה של הרחפן.
 * מכיל offset ראשוני שמתקן את זווית המודל כך שתסונכרן עם ה-internal heading שלך.
 */
export class DroneOrientationManager {
  private drone: Cesium.Entity;
  private headingOffset: number;

  constructor(drone: Cesium.Entity, headingOffset: number) {
    this.drone = drone;
    this.headingOffset = headingOffset;
  }

  /**
   * Set the drone orientation based on internal heading and the offset.
   * @param heading internal heading (radians)
   * @param position current drone position
   * @returns the quaternion applied
   */
  setOrientationFromHeading(heading: number, position: Cesium.Cartesian3): Cesium.Quaternion {
    const correctedHeading = heading + this.headingOffset;

    // Pitch ו-Roll נשארים 0
    const hpr = new Cesium.HeadingPitchRoll(correctedHeading, 0, 0);
    const quat = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);

    this.drone.orientation = new Cesium.ConstantProperty(quat);

    return quat;
  }

  /**
   * מחזיר את ה-heading של המודל לפי Quaternion הנוכחי
   * @param position current drone position
   * @returns heading in radians
   */
  getHeading(position: Cesium.Cartesian3): number {
    if (!this.drone.orientation) return 0;
    const time = Cesium.JulianDate.now(); // current time in viewer
    const quat = this.drone.orientation.getValue(time) as Cesium.Quaternion;
    if (!quat) return 0;

    const hpr = Cesium.HeadingPitchRoll.fromQuaternion(quat);
    // מחזיר normalized (-π..π)
    //return Cesium.Math.negativePiToPi(hpr.heading);
    return hpr.heading + Cesium.Math.toRadians(90)
  }
}
