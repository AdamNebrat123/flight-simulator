import * as Cesium from "cesium";
import type { Drone } from "../../Messages/AllTypes";

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

  // חדש: מוסיף רחפן רק לפי ID עם מיקום ואוריינטציה דיפולטיביים
  addDroneById(droneId: string): Cesium.Entity | null {
    if (this.droneIdToEntity.has(droneId)) {
      console.log(`Drone ${droneId} already exists, ignoring.`);
      return this.droneIdToEntity.get(droneId)!;
    }

    try {
      const defaultPos = Cesium.Cartesian3.fromDegrees(34.78217676812864, 32.02684069644974, 160);
      const defaultHpr = new Cesium.HeadingPitchRoll(
        Cesium.Math.toRadians(0), // heading
        Cesium.Math.toRadians(0), // pitch
        0 // roll
      );
      const orientation = Cesium.Transforms.headingPitchRollQuaternion(defaultPos, defaultHpr);

      const entity = this.viewer.entities.add({
        id: droneId,
        position: new Cesium.ConstantPositionProperty(defaultPos),
        orientation: new Cesium.ConstantProperty(orientation),
        model: {
          uri: "https://raw.githubusercontent.com/CesiumGS/cesium/master/Apps/SampleData/models/CesiumDrone/CesiumDrone.glb",
          minimumPixelSize: 64,
          color: Cesium.Color.WHITE,
          silhouetteColor: Cesium.Color.YELLOW,
          silhouetteSize: 2,
        },
      });

      this.droneIdToEntity.set(droneId, entity);
      console.log(`Drone ${droneId} created at default position.`);
      return entity;
    } catch (err) {
      console.error("Failed to add drone:", err);
      return null;
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
      let entity = this.droneIdToEntity.get(drone.id);

      // אם הרחפן עדיין לא קיים, צור אותו
      if (!entity) {
        entity = this.addDroneById(drone.id)!;
        if (!entity) return false;
      }

      try {
        const pos = Cesium.Cartesian3.fromDegrees(
          drone.trajectoryPoint.position.longitude,
          drone.trajectoryPoint.position.latitude,
          drone.trajectoryPoint.position.altitude
        );

        const hpr = new Cesium.HeadingPitchRoll(
          Cesium.Math.toRadians(drone.trajectoryPoint.heading) + Cesium.Math.toRadians(90),
          Cesium.Math.toRadians(drone.trajectoryPoint.pitch),
          Cesium.Math.toRadians(drone.trajectoryPoint.roll)
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
