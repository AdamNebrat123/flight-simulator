// PlanePolylineManager.ts
import * as Cesium from "cesium";
import type { GeoPoint } from "../Messages/AllTypes";

export class PlanePolylineManager {
  private viewer: Cesium.Viewer;
  private planeToEntity: Map<string, Cesium.Entity>;
  private planeToPoints: Map<string, GeoPoint[]>;

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
    this.planeToEntity = new Map();
    this.planeToPoints = new Map();
  }

  createPolyline(planeName: string) {
    if (this.planeToEntity.has(planeName)) return;

    // Initialize points array
    this.planeToPoints.set(planeName, []);

    const entity = this.viewer.entities.add({
      name: planeName,
      polyline: {
        positions: new Cesium.CallbackProperty(() => {
          const points = this.planeToPoints.get(planeName);
          if (!points || points.length < 2) {
            // חייב להיות לפחות שתי נקודות בשביל polyline
            return undefined;
          }
          return Cesium.Cartesian3.fromDegreesArrayHeights(
            points.flatMap((p) => [p.longitude, p.latitude, p.altitude])
          );
        }, false),
        width: 3,
        material: Cesium.Color.CYAN,
      },
    });

    this.planeToEntity.set(planeName, entity);
  }

  addPoint(planeName: string, point: GeoPoint) {
    if (!this.planeToPoints.has(planeName)) return;
    this.planeToPoints.get(planeName)!.push(point);
  }

  getPoints(planeName: string): GeoPoint[] {
    return this.planeToPoints.get(planeName) || [];
  }

  removePolyline(planeName: string) {
    const entity = this.planeToEntity.get(planeName);
    if (entity) {
      this.viewer.entities.remove(entity);
    }
    this.planeToEntity.delete(planeName);
    this.planeToPoints.delete(planeName);
  }

  clearAll() {
    for (const entity of this.planeToEntity.values()) {
      this.viewer.entities.remove(entity);
    }
    this.planeToEntity.clear();
    this.planeToPoints.clear();
  }
}
