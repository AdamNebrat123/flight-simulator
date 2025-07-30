import { TrajectoryPoint } from "./TrajectoryPoint.js";
import { GeoPoint } from "./GeoPoint.js";
export class PlaneCalculatedTrajectoryPoints {
    constructor(raw) {
        this.planeName = raw.planeName;
        this.trajectoryPoints = raw.trajectoryPoints.map(tp =>
            new TrajectoryPoint(
                new GeoPoint(tp.position.longitude, tp.position.latitude, tp.position.altitude),
                tp.heading,
                tp.pitch
            )
        );
    }
    toString() {
        const pointsStr = this.trajectoryPoints.map(tp => tp.toString()).join(", ");
        return `Plane: ${this.planeName}\nTrajectoryPoints: [${pointsStr}]`;
    }
}