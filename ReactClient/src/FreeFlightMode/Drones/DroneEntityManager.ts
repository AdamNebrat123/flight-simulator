import * as Cesium from "cesium";
import type { Drone } from "../../Messages/AllTypes";
import { toast } from "react-toastify";

export class DroneEntityManager {
  private static instance: DroneEntityManager | null = null;

  private viewer: Cesium.Viewer;
  private droneIdToEntity: Map<string, Cesium.Entity>;

  private constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
    this.droneIdToEntity = new Map<string, Cesium.Entity>();
  }

  public static getInstance(viewer?: Cesium.Viewer): DroneEntityManager {
    if (!DroneEntityManager.instance) {
      if (!viewer) {
        throw new Error("Viewer must be provided for the first getInstance call");
      }
      DroneEntityManager.instance = new DroneEntityManager(viewer);
    }
    return DroneEntityManager.instance;
  }

  tryAddDrone(drone: Drone): boolean {
    if (!drone || !drone.id) {
      toast.error("Invalid drone or missing id");
      return false;
    }

    if (this.droneIdToEntity.has(drone.id)) {
      toast.error(`Drone with id ${drone.id} already exists`);
      return false;
    }

    try {
      const pos = Cesium.Cartesian3.fromDegrees(
        drone.trajectoryPoint.position.longitude,
        drone.trajectoryPoint.position.latitude,
        drone.trajectoryPoint.position.altitude
      );

      const hpr = new Cesium.HeadingPitchRoll(
        Cesium.Math.toRadians(drone.trajectoryPoint.heading),
        Cesium.Math.toRadians(drone.trajectoryPoint.pitch),
        0 // roll תמיד 0
      );

      const orientation = Cesium.Transforms.headingPitchRollQuaternion(pos, hpr);

      const entity = this.viewer.entities.add({
        id: drone.id,
        position: new Cesium.ConstantPositionProperty(pos),
        orientation: new Cesium.ConstantProperty(orientation),
        model: {
          uri: "https://raw.githubusercontent.com/CesiumGS/cesium/master/Apps/SampleData/models/CesiumDrone/CesiumDrone.glb",
          minimumPixelSize: 64,
          color: Cesium.Color.WHITE.withAlpha(0.9),
          silhouetteColor: Cesium.Color.YELLOW,
          silhouetteSize: 1.4,
        },
      });

      this.droneIdToEntity.set(drone.id, entity);
      return true;
    } catch (err) {
      console.error("Failed to add drone:", err);
      return false;
    }
  }

  removeDrone(droneId: string): boolean {
    const entity = this.droneIdToEntity.get(droneId);
    if (!entity) return false;

    this.viewer.entities.remove(entity);
    this.droneIdToEntity.delete(droneId);
    return true;
  }

  editDrone(drone: Drone): boolean {
    const entity = this.droneIdToEntity.get(drone.id);
    if (!entity) return false;

    try {
      const pos = Cesium.Cartesian3.fromDegrees(
        drone.trajectoryPoint.position.longitude,
        drone.trajectoryPoint.position.latitude,
        drone.trajectoryPoint.position.altitude
      );

      const hpr = new Cesium.HeadingPitchRoll(
        Cesium.Math.toRadians(drone.trajectoryPoint.heading) + Cesium.Math.toRadians(90),
        Cesium.Math.toRadians(drone.trajectoryPoint.pitch),
        0
      );

      entity.position = new Cesium.ConstantPositionProperty(pos);
      entity.orientation = new Cesium.ConstantProperty(
        Cesium.Transforms.headingPitchRollQuaternion(pos, hpr)
      );

      return true;
    } catch (err) {
      console.error("Failed to edit drone:", err);
      return false;
    }
  }

  getDroneEntity(droneId: string): Cesium.Entity | null {
    return this.droneIdToEntity.get(droneId) ?? null;
  }

  getAllDroneIds(): string[] {
    return Array.from(this.droneIdToEntity.keys());
  }

  clearAllDrones() {
    for (const entity of this.droneIdToEntity.values()) {
      this.viewer.entities.remove(entity);
    }
    this.droneIdToEntity.clear();
  }
}
