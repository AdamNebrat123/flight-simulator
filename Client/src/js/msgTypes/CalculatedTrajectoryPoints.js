import { TrajectoryPoint } from "./TrajectoryPoint.js";
import { GeoPoint } from "./GeoPoint.js";

export class CalculatedTrajectoryPoints {
    constructor(trajectoryPoints) {
        // Expecting an array of plain objects → convert them to TrajectoryPoint instances
        this.trajectoryPoints = trajectoryPoints.map(p =>
        new TrajectoryPoint(
        new GeoPoint(p.Position.longitude, p.Position.latitude, p.Position.height),
        p.Heading,
        p.Pitch
        ));
        }
}