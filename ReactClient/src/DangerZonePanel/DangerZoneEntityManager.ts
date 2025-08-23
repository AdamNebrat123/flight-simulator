import * as Cesium from "cesium";
import { toast } from "react-toastify";

export class DangerZoneEntityManager {
  private viewer: Cesium.Viewer;
  private zoneNameToEntity: Map<string, Cesium.Entity>;
  private blinkingZones = new Set<string>();

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
    this.zoneNameToEntity = new Map<string, Cesium.Entity>();
  }

  tryAddDangerZone(name: string, entity: Cesium.Entity) {
    if (this.zoneNameToEntity.has(name)) {
        // already exists
        toast.error("A danger zone with that name already exists. Couldn't save.");
        console.log("Not added to zoneNameToEntity");
        // Remove the new entity from Cesium
        this.viewer?.entities.remove(entity);
        return;
    }

    // Add the entity if the name is unique
    this.zoneNameToEntity.set(name, entity);
    console.log("Added to zoneNameToEntity");
  }

  getDangerZone(name: string): Cesium.Entity | null {
    return this.zoneNameToEntity.get(name) ?? null;
  }

  removeDangerZone(name: string) {
    if (!this.viewer) return;

    const entity = this.zoneNameToEntity.get(name);
    if (entity) {
      this.viewer.entities.remove(entity);
      this.zoneNameToEntity.delete(name);
    }
  }

  getAllDangerZoneNames(): string[] {
    return Array.from(this.zoneNameToEntity.keys());
  }

  clearAllDangerZones() {
    if (!this.viewer) return;

    for (const entity of this.zoneNameToEntity.values()) {
      this.viewer.entities.remove(entity);
    }
    this.zoneNameToEntity.clear();
    this.blinkingZones.clear();
  }

    startBlinking(name: string) {
        const entity = this.zoneNameToEntity.get(name);
        if (!entity || !entity.polygon) return;

        if (this.blinkingZones.has(name)) return; // already blinking
        this.blinkingZones.add(name);

        // Swap between red and yellow
        entity.polygon.material = new Cesium.ColorMaterialProperty(
        new Cesium.CallbackProperty(() => {
            const seconds = Date.now() / 500;
            const isRed = Math.floor(seconds) % 2 === 0;
            return isRed ? Cesium.Color.RED.withAlpha(0.3) : Cesium.Color.YELLOW.withAlpha(0.3);
        }, false)
        );

        entity.polygon.outlineColor = new Cesium.CallbackProperty(() => {
            const seconds = Date.now() / 500;
            const isRed = Math.floor(seconds) % 2 === 0;
            return isRed ? Cesium.Color.RED : Cesium.Color.YELLOW;
        }, false);
    }

    stopBlinking(name: string) {
        const entity = this.zoneNameToEntity.get(name);
        if (!entity || !entity.polygon) return;

        if (!this.blinkingZones.has(name)) return;
        this.blinkingZones.delete(name);

        // Return to constant red
        entity.polygon.material = new Cesium.ColorMaterialProperty(
            Cesium.Color.RED.withAlpha(0.3)
        );
        entity.polygon.outlineColor = new Cesium.ConstantProperty(Cesium.Color.RED);
    }
}
