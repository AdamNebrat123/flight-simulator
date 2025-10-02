import * as Cesium from "cesium";

/**
 * Drone orientation manager.
 * Contains an initial offset that corrects the model's angle so it synchronizes with your internal heading.
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

    // Pitch and Roll remain 0
    const hpr = new Cesium.HeadingPitchRoll(correctedHeading, 0, 0);
    const quat = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);

    this.drone.orientation = new Cesium.ConstantProperty(quat);

    return quat;
  }

  /**
   * Returns the model's heading based on the current quaternion
   * @param position current drone position
   * @returns heading in radians
   */
  getHeading(position: Cesium.Cartesian3): number {
    if (!this.drone.orientation) return 0;
    const time = Cesium.JulianDate.now(); // current time in viewer
    const quat = this.drone.orientation.getValue(time) as Cesium.Quaternion;
    if (!quat) return 0;

    const hpr = Cesium.HeadingPitchRoll.fromQuaternion(quat);
    
    return hpr.heading + Cesium.Math.toRadians(90)
  }
}
