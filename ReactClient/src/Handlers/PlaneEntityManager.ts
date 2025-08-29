import * as Cesium from 'cesium';

export class PlaneEntityManager {
  private static instance: PlaneEntityManager | null = null;

  private viewer: Cesium.Viewer | null = null;
  private planeNameToEntity: Map<string, Cesium.Entity>;
  private blinkingPlanes = new Set<string>();

  // Private constructor for singleton
  private constructor(viewer?: Cesium.Viewer) {
    this.viewer = viewer ?? null;
    this.planeNameToEntity = new Map<string, Cesium.Entity>();
  }

  // Static method to get the singleton instance
  public static getInstance(viewer?: Cesium.Viewer): PlaneEntityManager {
    if (!PlaneEntityManager.instance) {
      PlaneEntityManager.instance = new PlaneEntityManager(viewer);
    } else if (viewer) {
      // If instance exists but viewer is provided, update it
      PlaneEntityManager.instance.setViewer(viewer);
    }
    return PlaneEntityManager.instance;
  }

  setViewer(viewer: Cesium.Viewer) {
    this.viewer = viewer;
  }

  updateOrCreateEntity(
    planeName: string,
    position: Cesium.Cartesian3,
    headingDegrees: number,
    pitchDegrees: number
  ) {
    if (!this.viewer) return;

    const heading = Cesium.Math.toRadians(headingDegrees - 90);
    const pitch = Cesium.Math.toRadians(pitchDegrees);
    const roll = 0.0;

    const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
    const orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);

    if (this.planeNameToEntity.has(planeName)) {
      const entity = this.planeNameToEntity.get(planeName)!;
      entity.position = new Cesium.ConstantPositionProperty(position);
      entity.orientation = new Cesium.ConstantProperty(orientation);
    } else {
      const entity = this.viewer.entities.add({
        position: position,
        orientation: orientation,
        model: {
          uri: "https://raw.githubusercontent.com/CesiumGS/cesium/master/Apps/SampleData/models/CesiumAir/Cesium_Air.glb",
          scale: 1.5,
          minimumPixelSize: 64,
          color: Cesium.Color.WHITE,
          lightColor: new Cesium.Color(1.0, 1.0, 1.0, 1.0),
          silhouetteColor: Cesium.Color.YELLOW,
          silhouetteSize: 2.0,
        },
        label: {
          text: planeName,
          font: "14px sans-serif",
          fillColor: Cesium.Color.WHITE,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -12),
        },
        name: planeName,
      });
      this.planeNameToEntity.set(planeName, entity);
      console.log("added plane!!!!")
    }
  }

  getEntity(planeName: string): Cesium.Entity | null {
    return this.planeNameToEntity.get(planeName) ?? null;
  }

  removeEntity(planeName: string) {
    if (!this.viewer) return;
    const entity = this.planeNameToEntity.get(planeName);
    if (entity) {
      this.viewer.entities.remove(entity);
      this.planeNameToEntity.delete(planeName);
    }
  }

  hasEntity(planeName: string): boolean {
    return this.planeNameToEntity.has(planeName);
  }

  clearAllEntities() {
    if (!this.viewer) return;

    for (const entity of this.planeNameToEntity.values()) {
      this.viewer.entities.remove(entity);
    }
    this.planeNameToEntity.clear();
    console.log("All planes removed!");
  }

  startBlinking(planeName: string) {
    const entity = this.planeNameToEntity.get(planeName);
    if (!entity || !entity.model) return;
    if (this.blinkingPlanes.has(planeName)) return;

    this.blinkingPlanes.add(planeName);

    entity.model.color = new Cesium.CallbackProperty(() => {
      const seconds = Date.now() / 500;
      return Math.floor(seconds) % 2 === 0 ? Cesium.Color.RED : Cesium.Color.WHITE;
    }, false);

    entity.model.silhouetteColor = new Cesium.CallbackProperty(() => {
      const seconds = Date.now() / 500;
      return Math.floor(seconds) % 2 === 0 ? Cesium.Color.RED : Cesium.Color.YELLOW;
    }, false);
  }

  stopBlinking(planeName: string) {
    const entity = this.planeNameToEntity.get(planeName);
    if (!entity || !entity.model) return;
    if (!this.blinkingPlanes.has(planeName)) return;

    this.blinkingPlanes.delete(planeName);

    entity.model.color = new Cesium.ConstantProperty(Cesium.Color.WHITE);
    entity.model.silhouetteColor = new Cesium.ConstantProperty(Cesium.Color.YELLOW);
  }
}
