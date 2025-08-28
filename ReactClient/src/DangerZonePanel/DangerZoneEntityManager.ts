import * as Cesium from "cesium";
import { toast } from "react-toastify";
import type { DangerZone } from "../Messages/AllTypes";

export class DangerZoneEntityManager {
  private static instance: DangerZoneEntityManager | null = null;

  private viewer: Cesium.Viewer;
  private zoneIdToEntity: Map<string, Cesium.Entity>;
  private blinkingZones = new Set<string>();

  // Private constructor for singleton
  private constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
    this.zoneIdToEntity = new Map<string, Cesium.Entity>();
  }

  public static GetInstance(viewer?: Cesium.Viewer): DangerZoneEntityManager {
    if (!DangerZoneEntityManager.instance) {
      if (!viewer) {
        throw new Error("Viewer must be provided for the first GetInstance call");
      }
      DangerZoneEntityManager.instance = new DangerZoneEntityManager(viewer);
    }
    return DangerZoneEntityManager.instance;
  }

  tryAddDangerZone(dangerZone: DangerZone) {
    if (!dangerZone || !dangerZone.zoneId) {
      toast.error("Invalid DangerZone or missing zoneId");
      return;
    }

    if (this.zoneIdToEntity.has(dangerZone.zoneId)) {
      toast.error(
        `A danger zone with id ${dangerZone.zoneId} already exists. Couldn't save.`
      );
      return;
    }

    const entity = this.tryCreatePolygon(dangerZone);
    this.zoneIdToEntity.set(dangerZone.zoneId, entity);
  }

  getDangerZone(zoneId: string): Cesium.Entity | null {
    return this.zoneIdToEntity.get(zoneId) ?? null;
  }

  removeDangerZone(zoneId: string) {
    const entity = this.zoneIdToEntity.get(zoneId);
    if (entity) {
      this.viewer.entities.remove(entity);
      this.zoneIdToEntity.delete(zoneId);
      this.blinkingZones.delete(zoneId);
    }
  }

  editDangerZone(dangerZone: DangerZone) {
    if (!dangerZone || !dangerZone.zoneId) {
      toast.error("Invalid DangerZone or missing zoneId");
      return false;
    }

    if (!this.zoneIdToEntity.has(dangerZone.zoneId)) {
      toast.error(`Danger zone with id ${dangerZone.zoneId} does not exist`);
      return false;
    }

    // remove the old entity
    const oldEntity = this.zoneIdToEntity.get(dangerZone.zoneId);
    if (oldEntity) {
      this.viewer.entities.remove(oldEntity);
    }

    // create and save new entity
    const newEntity = this.tryCreatePolygon(dangerZone);
    this.zoneIdToEntity.set(dangerZone.zoneId, newEntity);

    // if this zone was blinking, restart its blinking effect
    if (this.blinkingZones.has(dangerZone.zoneId)) {
      this.startBlinking(dangerZone.zoneId);
    }

    return true;
  }


  getAllDangerZoneIds(): string[] {
    return Array.from(this.zoneIdToEntity.keys());
  }

  clearAllDangerZones() {
    for (const entity of this.zoneIdToEntity.values()) {
      this.viewer.entities.remove(entity);
    }
    this.zoneIdToEntity.clear();
    this.blinkingZones.clear();
  }

  startBlinking(zoneId: string) {
    const entity = this.zoneIdToEntity.get(zoneId);
    if (!entity || !entity.polygon) return;
    if (this.blinkingZones.has(zoneId)) return;

    this.blinkingZones.add(zoneId);

    entity.polygon.material = new Cesium.ColorMaterialProperty(
      new Cesium.CallbackProperty(() => {
        const seconds = Date.now() / 500;
        const isRed = Math.floor(seconds) % 2 === 0;
        return isRed
          ? Cesium.Color.RED.withAlpha(0.3)
          : Cesium.Color.YELLOW.withAlpha(0.3);
      }, false)
    );

    entity.polygon.outlineColor = new Cesium.CallbackProperty(() => {
      const seconds = Date.now() / 500;
      const isRed = Math.floor(seconds) % 2 === 0;
      return isRed ? Cesium.Color.RED : Cesium.Color.YELLOW;
    }, false);
  }

  stopBlinking(zoneId: string) {
    const entity = this.zoneIdToEntity.get(zoneId);
    if (!entity || !entity.polygon) return;
    if (!this.blinkingZones.has(zoneId)) return;

    this.blinkingZones.delete(zoneId);

    entity.polygon.material = new Cesium.ColorMaterialProperty(
      Cesium.Color.RED.withAlpha(0.3)
    );
    entity.polygon.outlineColor = new Cesium.ConstantProperty(Cesium.Color.RED);
  }

  private tryCreatePolygon(dangerZone: DangerZone): Cesium.Entity {
    const entity = this.viewer!.entities.add({
      name: dangerZone.zoneName,
      polygon:
        dangerZone.points.length >= 3
          ? {
              hierarchy: Cesium.Cartesian3.fromDegreesArray(
                dangerZone.points.flatMap((p) => [p.longitude, p.latitude])
              ),
              perPositionHeight: true,
              height: dangerZone.bottomHeight,
              extrudedHeight: dangerZone.topHeight,
              material: Cesium.Color.RED.withAlpha(0.3),
              outline: true,
              outlineColor: Cesium.Color.RED,
            }
          : undefined,
    });

    return entity;
  }
}
