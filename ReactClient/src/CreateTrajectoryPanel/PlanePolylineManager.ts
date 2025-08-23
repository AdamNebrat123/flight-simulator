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
            // There must be at least two points for a polyline
            return undefined;
          }
          return Cesium.Cartesian3.fromDegreesArrayHeights(
            points.flatMap((p) => [p.longitude, p.latitude, p.altitude])
          );
        }, false),
        width: 3,
        material: Cesium.Color.YELLOW,
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

  setPlanePolylineColor(planeName: string, color: Cesium.Color) {
    const entity = this.planeToEntity.get(planeName);
    if (!entity) return;

    if (entity.polyline) {
      entity.polyline.material = new Cesium.ColorMaterialProperty(color);
    }
  }
  
  // when polyline is cyan its the default
  setPlanePolylineColorCyan(planeName: string) {
    this.setPlanePolylineColor(planeName, Cesium.Color.CYAN);
  }

  // when polyline is yellow it means that we selected a spcific plane's trajectory so it will be differnt from the other trajectories.
  setPlanePolylineColorYellow(planeName: string) {
    this.setPlanePolylineColor(planeName, Cesium.Color.YELLOW);
  }

  clearAll() {
    for (const entity of this.planeToEntity.values()) {
      this.viewer.entities.remove(entity);
    }
    this.planeToEntity.clear();
    this.planeToPoints.clear();
  }
}
