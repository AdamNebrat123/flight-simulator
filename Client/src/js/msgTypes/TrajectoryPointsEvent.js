export class TrajectoryPointsEvent {
  constructor(planeTrajectoryPoints, velocity) {
    this.PlaneTrajectoryPoints = planeTrajectoryPoints;
    this.Velocity = velocity;
  }
}