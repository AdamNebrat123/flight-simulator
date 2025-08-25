import * as Cesium from "cesium";
import type { GeoPoint } from "../Messages/AllTypes";

export class DangerZonePolylineManager {
  private viewer: Cesium.Viewer;
  private zoneNameToPolyline: Map<string, Cesium.Entity>;
  private zoneNameToClosingPolyline: Map<string, Cesium.Entity>; //polyline to close the actual polygon shape
  private zoneNameToPoints: Map<string, GeoPoint[]>;
  private zoneNameToPointEntities: Map<string, Cesium.Entity[]>;
  

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
    this.zoneNameToPolyline = new Map();
    this.zoneNameToClosingPolyline = new Map();
    this.zoneNameToPoints = new Map();
    this.zoneNameToPointEntities = new Map()
  }

  createPolyline(zoneName: string) {
    if (this.zoneNameToPolyline.has(zoneName)) return;

    // Initialize points array
    this.zoneNameToPoints.set(zoneName, []);

    const entity = this.viewer.entities.add({
      name: zoneName,
      polyline: {
        positions: new Cesium.CallbackProperty(() => {
          const points = this.zoneNameToPoints.get(zoneName);
          if (!points || points.length < 2) {
            // There must be at least two points for a polyline
            return undefined;
          }
          return Cesium.Cartesian3.fromDegreesArrayHeights(
            points.flatMap((p) => [p.longitude, p.latitude, p.altitude])
          );
        }, false),
        width: 3,
        material: Cesium.Color.RED,
      },
    });

    this.zoneNameToPolyline.set(zoneName, entity);
  }
  createClosingPolyline(zoneName: string){
    if (this.zoneNameToClosingPolyline.has(zoneName)) return;
    
    const entity = this.viewer.entities.add({
    name: zoneName,
    polyline: {
        positions: new Cesium.CallbackProperty(() => {
        const points = this.zoneNameToPoints.get(zoneName);
        if (!points || points.length < 3) {
            return undefined; // minimum of three points
        }
        const first = points[0];
        const last = points[points.length - 1];

        return Cesium.Cartesian3.fromDegreesArrayHeights([
            first.longitude, first.latitude, first.altitude,
            last.longitude, last.latitude, last.altitude
        ]);
        }, false),
        width: 3,
        material: Cesium.Color.RED,
    },
    });

    this.zoneNameToClosingPolyline.set(zoneName, entity);
  }

  addPoint(zoneName: string, point: GeoPoint) {
      if (!this.zoneNameToPoints.has(zoneName)) return;

      const points = this.zoneNameToPoints.get(zoneName)!;
      points.push(point);

      // Create a point entity with a label
      const index = points.length; // Point number
      const pointEntity = this.viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(point.longitude, point.latitude, point.altitude),
          point: {
              pixelSize: 7,
              color: Cesium.Color.BLACK,
          },
          label: {
              text: `Point ${index}`,
              font: "bold 12px sans-serif",
              fillColor: Cesium.Color.WHITE,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              outlineWidth: 2,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -12),
          },
          name: `${zoneName}-point-${index}`,
      });

      if (!this.zoneNameToPointEntities.has(zoneName)) {
          this.zoneNameToPointEntities.set(zoneName, []);
      }
      this.zoneNameToPointEntities.get(zoneName)!.push(pointEntity);
  }

  updatePoint(zoneName: string, index: number, newPoint: GeoPoint) {
      const points = this.zoneNameToPoints.get(zoneName);
      if (!points || index < 0 || index >= points.length) return;

      points[index] = newPoint;

      const pointEntities = this.zoneNameToPointEntities.get(zoneName);
      if (pointEntities && index < pointEntities.length) {
          const entity = pointEntities[index];
          entity.position = new Cesium.ConstantPositionProperty(
              Cesium.Cartesian3.fromDegrees(newPoint.longitude, newPoint.latitude, newPoint.altitude)
          );
          entity.label!.text = new Cesium.ConstantProperty(`Point ${index + 1}`);
      }
  }

  getPoints(zoneName: string): GeoPoint[] {
    return this.zoneNameToPoints.get(zoneName) || [];
  }

  removePolyline(zoneName: string) {
    const entity = this.zoneNameToPolyline.get(zoneName);
    if (entity) {
      this.viewer.entities.remove(entity);
    }
    this.zoneNameToPolyline.delete(zoneName);
    this.zoneNameToPoints.delete(zoneName);
  }

  setClosingPolylineColor(zoneName: string, color: Cesium.Color) {
    const entity = this.zoneNameToClosingPolyline.get(zoneName);
    if (!entity) return;

    if (entity.polyline) {
      entity.polyline.material = new Cesium.ColorMaterialProperty(color);
    }
  }
  setPlanePolylineColorConstantRed(zoneName: string) {
    this.setClosingPolylineColor(zoneName, Cesium.Color.RED);
  }
  setPlanePolylineColorTransparentRed(zoneName: string) {
    this.setClosingPolylineColor(zoneName, Cesium.Color.RED.withAlpha(0.3));
  }

  clearAll() {
    for (const entity of this.zoneNameToPolyline.values()) {
      this.viewer.entities.remove(entity);
    }
    for (const entity of this.zoneNameToClosingPolyline.values()) {
      this.viewer.entities.remove(entity);
    }
    for (const entities of this.zoneNameToPointEntities.values()) {
      for(const entity of entities)
        this.viewer.entities.remove(entity);
    }
    this.zoneNameToPolyline.clear();
    this.zoneNameToClosingPolyline.clear();
    this.zoneNameToPoints.clear();
    this.zoneNameToPointEntities.clear();
  }
}
