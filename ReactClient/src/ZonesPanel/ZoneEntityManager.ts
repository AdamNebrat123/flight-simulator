import * as Cesium from "cesium";
import { toast } from "react-toastify";
import type {Zone, JamZone, DangerZone } from "../Messages/AllTypes";

export class ZoneEntityManager {
  private static instance: ZoneEntityManager | null = null;

  private viewer: Cesium.Viewer;
  private zoneIdToEntity: Map<string, Cesium.Entity>;
  private blinkingZones = new Set<string>();

  // Private constructor for singleton
  private constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
    this.zoneIdToEntity = new Map<string, Cesium.Entity>();
  }

  public static GetInstance(viewer?: Cesium.Viewer): ZoneEntityManager {
    if (!ZoneEntityManager.instance) {
      if (!viewer) {
        throw new Error("Viewer must be provided for the first GetInstance call");
      }
      ZoneEntityManager.instance = new ZoneEntityManager(viewer);
    }
    return ZoneEntityManager.instance;
  }

  tryAddZone(zone: Zone) {
    if (!zone || !zone.zoneId) {
      toast.error("Invalid DangerZone or missing zoneId");
      return;
    }

    if (this.zoneIdToEntity.has(zone.zoneId)) {
      toast.error(
        `A danger zone with id ${zone.zoneId} already exists. Couldn't save.`
      );
      return;
    }

    const entity = this.tryCreatePolygon(zone);
    this.zoneIdToEntity.set(zone.zoneId, entity);
  }

  getZone(zoneId: string): Cesium.Entity | null {
    return this.zoneIdToEntity.get(zoneId) ?? null;
  }

  removeZone(zoneId: string) {
    const entity = this.zoneIdToEntity.get(zoneId);
    if (entity) {
      this.viewer.entities.remove(entity);
      this.zoneIdToEntity.delete(zoneId);
      this.blinkingZones.delete(zoneId);
    }
  }

  editZone(zone: Zone) {
    if (!zone || !zone.zoneId) {
      toast.error("Invalid Zone or missing zoneId");
      return false;
    }

    if (!this.zoneIdToEntity.has(zone.zoneId)) {
      toast.error(`Danger zone with id ${zone.zoneId} does not exist`);
      return false;
    }

    // remove the old entity
    const oldEntity = this.zoneIdToEntity.get(zone.zoneId);
    if (oldEntity) {
      this.viewer.entities.remove(oldEntity);
    }

    // create and save new entity
    const newEntity = this.tryCreatePolygon(zone);
    this.zoneIdToEntity.set(zone.zoneId, newEntity);

    // if this zone was blinking, restart its blinking effect
    if (this.blinkingZones.has(zone.zoneId)) {
      this.startBlinking(zone.zoneId);
    }

    return true;
  }


  hideEntityById(zoneId: string) {
    const entity = this.zoneIdToEntity.get(zoneId);
    if (!entity) return;
    entity.show = false;
  }
  
  showEntityById(zoneId: string) {
    const entity = this.zoneIdToEntity.get(zoneId);
    if (!entity) return;
    entity.show = true;
  }
  getAllZoneIds(): string[] {
    return Array.from(this.zoneIdToEntity.keys());
  }

  clearAllZones() {
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

  private tryCreatePolygon(zone: Zone): Cesium.Entity {
    const entity = this.viewer!.entities.add({
      name: zone.zoneName,
      polygon:
        zone.points.length >= 3
          ? {
              hierarchy: Cesium.Cartesian3.fromDegreesArray(
                zone.points.flatMap((p) => [p.longitude, p.latitude])
              ),
              perPositionHeight: true,
              height: zone.bottomHeight,
              extrudedHeight: zone.topHeight,
              material: Cesium.Color.RED.withAlpha(0.3),
              outline: true,
              outlineColor: Cesium.Color.RED,
            }
          : undefined,
    });

    return entity;
  }
}
