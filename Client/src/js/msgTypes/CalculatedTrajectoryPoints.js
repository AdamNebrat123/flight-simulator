import { TrajectoryPoint } from "./TrajectoryPoint.js";
import { GeoPoint } from "./GeoPoint.js";
import { PlaneTrajectoryPoint } from "./PlaneTrajectoryPoint.js";
export class CalculatedTrajectoryPoints {
    constructor(trajectoryPoints) {
        // Expecting an array of plain objects → convert them to TrajectoryPoint instances
        this.trajectoryPoints = trajectoryPoints.map(p =>
            new TrajectoryPoint(
                new PlaneTrajectoryPoint(
                    new GeoPoint(
                        p.PlaneTrajectoryPoint.position.longitude,
                        p.PlaneTrajectoryPoint.position.latitude,
                        p.PlaneTrajectoryPoint.position.height
                    ),
                    p.PlaneTrajectoryPoint.name
                ),
                p.Heading,
                p.Pitch
            )
        );
    }
}