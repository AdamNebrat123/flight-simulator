export class TrajectoryPoint {
  constructor(position, heading, pitch) {
    this.position = position; // should be a GeoPoint instance
    this.heading = heading;
    this.pitch = pitch;
  }

  toString() {
    return `[${this.position.toString()}, Heading=${this.heading}, Pitch=${this.pitch}]`;
  }
}