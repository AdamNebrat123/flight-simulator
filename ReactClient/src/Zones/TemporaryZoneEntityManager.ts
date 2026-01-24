import * as Cesium from "cesium";
import { toast } from "react-toastify";
import type {Zone, JamZone, DangerZone } from "../Messages/AllTypes";
import { ZoneOptionsManager } from "./ZoneOptions";

export class TemporaryZoneEntityManager {
  private static instance: TemporaryZoneEntityManager | null = null;

  private viewer: Cesium.Viewer;
  private zoneNameToEntity: Map<string, Cesium.Entity>;
  private blinkingZones = new Set<string>();

  private constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
    this.zoneNameToEntity = new Map<string, Cesium.Entity>();
  }

  public static GetInstance(viewer?: Cesium.Viewer): TemporaryZoneEntityManager {
    if (!TemporaryZoneEntityManager.instance) {
      if (!viewer) {
        throw new Error("Viewer must be provided for the first GetInstance call");
      }
      TemporaryZoneEntityManager.instance = new TemporaryZoneEntityManager(viewer);
    }
    return TemporaryZoneEntityManager.instance;
  }

  tryAddZone(zone: Zone) {
    if (!zone || !zone.zoneName) {
      toast.error("Invalid DangerZone or missing zoneId");
      return;
    }

    if (this.zoneNameToEntity.has(zone.zoneName)) {
      toast.error(
        `A danger zone with id ${zone.zoneName} already exists. Couldn't save.`
      );
      return;
    }

    const entity = this.tryCreatePolygon(zone);
    this.zoneNameToEntity.set(zone.zoneName, entity);
  }

  getZone(zoneName: string): Cesium.Entity | null {
    return this.zoneNameToEntity.get(zoneName) ?? null;
  }

  removeZone(zoneName: string) {
    const entity = this.zoneNameToEntity.get(zoneName);
    if (entity) {
      this.viewer.entities.remove(entity);
      this.zoneNameToEntity.delete(zoneName);
      this.blinkingZones.delete(zoneName);
    }
  }

  editZone(zone: Zone) {
    if (!zone || !zone.zoneName) {
      toast.error("Invalid Zone or missing zoneId");
      return false;
    }

    if (!this.zoneNameToEntity.has(zone.zoneName)) {
      toast.error(`Danger zone with id ${zone.zoneName} does not exist`);
      return false;
    }

    // remove the old entity
    const oldEntity = this.zoneNameToEntity.get(zone.zoneName);
    if (oldEntity) {
      this.viewer.entities.remove(oldEntity);
    }

    // create and save new entity
    const newEntity = this.tryCreatePolygon(zone);
    this.zoneNameToEntity.set(zone.zoneName, newEntity);

    // if this zone was blinking, restart its blinking effect
    if (this.blinkingZones.has(zone.zoneName)) {
      this.startBlinking(zone.zoneName);
    }

    return true;
  }


  hideEntityById(zoneName: string) {
    const entity = this.zoneNameToEntity.get(zoneName);
    if (!entity) return;
    entity.show = false;
  }
  
  showEntityById(zoneName: string) {
    const entity = this.zoneNameToEntity.get(zoneName);
    if (!entity) return;
    entity.show = true;
  }
  getAllZoneIds(): string[] {
    return Array.from(this.zoneNameToEntity.keys());
  }

  clearAllZones() {
    for (const entity of this.zoneNameToEntity.values()) {
      this.viewer.entities.remove(entity);
    }
    this.zoneNameToEntity.clear();
    this.blinkingZones.clear();
  }

  startBlinking(zoneName: string) {
    const entity = this.zoneNameToEntity.get(zoneName);
    if (!entity || !entity.polygon) return;
    if (this.blinkingZones.has(zoneName)) return;

    this.blinkingZones.add(zoneName);

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
    const entity = this.zoneNameToEntity.get(zoneId);
    if (!entity || !entity.polygon) return;
    if (!this.blinkingZones.has(zoneId)) return;

    this.blinkingZones.delete(zoneId);

    entity.polygon.material = new Cesium.ColorMaterialProperty(
      Cesium.Color.RED.withAlpha(0.3)
    );
    entity.polygon.outlineColor = new Cesium.ConstantProperty(Cesium.Color.RED);
  }

  private tryCreatePolygon(zone: Zone): Cesium.Entity {

    const zoneOptions = ZoneOptionsManager.getZoneOptionsByString(zone.zoneType);
    const color = zoneOptions ? zoneOptions.color : Cesium.Color.RED;
    const oppacity = zoneOptions ? zoneOptions.oppacity : 0.3;

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
              material: color.withAlpha(oppacity),
              outline: true,
              outlineColor: color,
            }
          : undefined,
    });

    return entity;
  }
}
