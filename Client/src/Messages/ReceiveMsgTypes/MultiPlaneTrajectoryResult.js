import { PlaneCalculatedTrajectoryPoints } from "../Components/PlaneCalculatedTrajectoryPoints.js";
export class MultiPlaneTrajectoryResult {
    constructor(raw) {
        this.planes = raw.planes.map(p => new PlaneCalculatedTrajectoryPoints(p));
    }

    toString() {
        return this.planes.map(p => p.toString()).join("\n\n");
    }
}