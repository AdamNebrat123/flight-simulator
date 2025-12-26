// PlanePolylineManager.ts
import * as Cesium from "cesium";
import type { GeoPoint, Scenario } from "../Messages/AllTypes";

export class PlanePolylineManager {
  private viewer: Cesium.Viewer;
  private planeToEntity: Map<string, Cesium.Entity>;
  private planeToPoints: Map<string, GeoPoint[]>;
  private planeToPointEntities: Map<string, Cesium.Entity[]>;

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
    this.planeToEntity = new Map();
    this.planeToPoints = new Map();
    this.planeToPointEntities = new Map()
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

      const points = this.planeToPoints.get(planeName)!;
      points.push(point);

      // Create a point entity with a label
      const index = points.length; // Point number
      const pointEntity = this.viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(point.longitude, point.latitude, point.altitude),
          point: {
              pixelSize: 7,
              color: Cesium.Color.RED,
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
          name: `${planeName}-point-${index}`,
      });

      if (!this.planeToPointEntities.has(planeName)) {
          this.planeToPointEntities.set(planeName, []);
      }
      this.planeToPointEntities.get(planeName)!.push(pointEntity);
  }

  updatePoint(planeName: string, index: number, newPoint: GeoPoint) {
      const points = this.planeToPoints.get(planeName);
      if (!points || index < 0 || index >= points.length) return;

      points[index] = newPoint;

      const pointEntities = this.planeToPointEntities.get(planeName);
      if (pointEntities && index < pointEntities.length) {
          const entity = pointEntities[index];
          entity.position = new Cesium.ConstantPositionProperty(
              Cesium.Cartesian3.fromDegrees(newPoint.longitude, newPoint.latitude, newPoint.altitude)
          );
          entity.label!.text = new Cesium.ConstantProperty(`Point ${index + 1}`);
      }
  }

  loadExistingPolylines(scenario: Scenario) {
    if (!scenario || !scenario.aircrafts) return;

    for (const plane of scenario.aircrafts) {
      const { aircraftName: planeName, geoPoints } = plane;

      // Create a new polyline for this plane
      this.createPolyline(planeName);

      if (geoPoints && geoPoints.length > 0) {
        for (const point of geoPoints) {
          this.addPoint(planeName, point);
        }
      }

      // Set default color to cyan (since that's your baseline)
      this.setPlanePolylineColorCyan(planeName);
    }
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
    for (const entities of this.planeToPointEntities.values()) {
      for(const entity of entities)
        this.viewer.entities.remove(entity);
    }
    this.planeToEntity.clear();
    this.planeToPoints.clear();
    this.planeToPointEntities.clear();
  }
}
