export class TrajectoryPoint {
  constructor(planeTrajectoryPoint, heading, pitch) {
    this.planeTrajectoryPoint = planeTrajectoryPoint; // should be a PlaneTrajectoryPoint instance
    this.heading = heading;
    this.pitch = pitch;
  }

  toString() {
    return `[${this.planeTrajectoryPoint.toString()}, Heading=${this.heading}, Pitch=${this.pitch}]`;
  }
}