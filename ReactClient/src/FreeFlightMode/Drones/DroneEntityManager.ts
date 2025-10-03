import * as Cesium from "cesium";
import type { Drone } from "../../Messages/AllTypes";

// מנהל את הרחפנים ב-Cesium עם Position + Orientation
export class DroneEntityManager {
    private static instance: DroneEntityManager | null = null;
    private viewer: Cesium.Viewer;

    private constructor(viewer: Cesium.Viewer) {
        this.viewer = viewer;
    }

    public static getInstance(viewer: Cesium.Viewer): DroneEntityManager {
        if (!this.instance) {
            this.instance = new DroneEntityManager(viewer);
        }
        return this.instance;
    }

    public tryAddDrone(drone: Drone): boolean {
        try {
            // מחשבים את מיקום ה-Cartesian3
            const positionCartesian = Cesium.Cartesian3.fromDegrees(
                drone.trajectoryPoint.position.longitude,
                drone.trajectoryPoint.position.latitude,
                drone.trajectoryPoint.position.altitude
            );

            // מחשבים את ה-Quaternion עבור ההטיה
            const hpr = new Cesium.HeadingPitchRoll(
                Cesium.Math.toRadians(drone.trajectoryPoint.heading),
                Cesium.Math.toRadians(drone.trajectoryPoint.pitch),
                0 // Roll תמיד 0
            );
            const orientation = Cesium.Transforms.headingPitchRollQuaternion(
                positionCartesian,
                hpr
            );

            // מוסיפים את ה-entity
            this.viewer.entities.add({
                id: drone.droneId,
                name: "Drone",
                position: new Cesium.ConstantPositionProperty(positionCartesian),
                orientation: new Cesium.ConstantProperty(orientation),
                model: {
                    uri: "https://raw.githubusercontent.com/CesiumGS/cesium/master/Apps/SampleData/models/CesiumDrone/CesiumDrone.glb",
                    minimumPixelSize: 64,
                    color: Cesium.Color.WHITE.withAlpha(0.9),
                    silhouetteColor: Cesium.Color.YELLOW,
                    silhouetteSize: 1.4,
                },
            });

            return true;
        } catch (err) {
            console.error("Failed to add drone:", err);
            return false;
        }
    }

    public removeDrone(droneId: string): boolean {
        return this.viewer.entities.removeById(droneId);
    }

    public editDrone(drone: Drone): boolean {
        const entity = this.viewer.entities.getById(drone.droneId);
        if (!entity) return false;

        try {
            // מחושב מיקום חדש
            const newPos = Cesium.Cartesian3.fromDegrees(
                drone.trajectoryPoint.position.longitude,
                drone.trajectoryPoint.position.latitude,
                drone.trajectoryPoint.position.altitude
            );
            entity.position = new Cesium.ConstantPositionProperty(newPos);

            // מחושבת אוריינטציה חדשה
            const hpr = new Cesium.HeadingPitchRoll(
                Cesium.Math.toRadians(drone.trajectoryPoint.heading),
                Cesium.Math.toRadians(drone.trajectoryPoint.pitch),
                0
            );
            const quaternion = Cesium.Transforms.headingPitchRollQuaternion(newPos, hpr);
            entity.orientation = new Cesium.ConstantProperty(quaternion);

            return true;
        } catch (err) {
            console.error("Failed to edit drone:", err);
            return false;
        }
    }
}
