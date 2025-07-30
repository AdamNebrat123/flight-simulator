export class TrajectoryPointsEvent {
  constructor(geoPoints, velocity) {
    this.GeoPoints = geoPoints;
    this.Velocity = velocity;
  }
}