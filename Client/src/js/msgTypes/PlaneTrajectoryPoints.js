export class PlaneTrajectoryPoints {
    constructor(planeName, velocity, geoPoints) {
        this.planeName = planeName;
        this.velocity = velocity;
        this.geoPoints = geoPoints; // List of GeoPoint
    }
}