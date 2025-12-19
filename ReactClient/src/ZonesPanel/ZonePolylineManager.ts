import * as Cesium from "cesium";
import type {Zone,JamZone, DangerZone, GeoPoint } from "../Messages/AllTypes";

export class ZonePolyline {
  private viewer: Cesium.Viewer;

  private polyline?: Cesium.Entity;
  private closingPolyline?: Cesium.Entity;
  private points: GeoPoint[] = [];
  private pointEntities: Cesium.Entity[] = [];

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
  }

  createPolyline() {
    if (this.polyline) return;

    this.points = [];

    this.polyline = this.viewer.entities.add({
      polyline: {
        positions: new Cesium.CallbackProperty(() => {
          if (this.points.length < 2) return undefined;
          return Cesium.Cartesian3.fromDegreesArrayHeights(
            this.points.flatMap((p) => [p.longitude, p.latitude, p.altitude])
          );
        }, false),
        width: 3,
        material: Cesium.Color.RED,
      },
    });
  }

  createClosingPolyline() {
    if (this.closingPolyline) return;

    this.closingPolyline = this.viewer.entities.add({
      polyline: {
        positions: new Cesium.CallbackProperty(() => {
          if (this.points.length < 3) return undefined;
          const first = this.points[0];
          const last = this.points[this.points.length - 1];
          return Cesium.Cartesian3.fromDegreesArrayHeights([
            first.longitude, first.latitude, first.altitude,
            last.longitude, last.latitude, last.altitude,
          ]);
        }, false),
        width: 3,
        material: Cesium.Color.RED,
      },
    });
  }

  loadExistingPolylines(zone: Zone) {
    this.remove(); // clean up any existing junk

    this.createPolyline();
    this.createClosingPolyline();

    // rebuild all points from the provided DangerZone
    zone.points.forEach((p) => this.addPoint(p));
  }

  addPoint(point: GeoPoint) {
    this.points.push(point);

    const index = this.points.length;
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
      name: `point-${index}`,
    });

    this.pointEntities.push(pointEntity);
  }

  updatePoint(index: number, newPoint: GeoPoint) {
    if (index < 0 || index >= this.points.length) return;

    this.points[index] = newPoint;

    if (index < this.pointEntities.length) {
      const entity = this.pointEntities[index];
      entity.position = new Cesium.ConstantPositionProperty(
        Cesium.Cartesian3.fromDegrees(newPoint.longitude, newPoint.latitude, newPoint.altitude)
      );
      entity.label!.text = new Cesium.ConstantProperty(`Point ${index + 1}`);
    }
  }

  getPoints(): GeoPoint[] {
    return this.points;
  }

  remove() {
    if (this.polyline) this.viewer.entities.remove(this.polyline);
    if (this.closingPolyline) this.viewer.entities.remove(this.closingPolyline);
    for (const entity of this.pointEntities) {
      this.viewer.entities.remove(entity);
    }
    this.polyline = undefined;
    this.closingPolyline = undefined;
    this.points = [];
    this.pointEntities = [];
  }

  setClosingPolylineColor(color: Cesium.Color) {
    if (this.closingPolyline?.polyline) {
      this.closingPolyline.polyline.material = new Cesium.ColorMaterialProperty(color);
    }
  }

  setColorConstantRed() {
    this.setClosingPolylineColor(Cesium.Color.RED);
  }

  setColorTransparentRed() {
    this.setClosingPolylineColor(Cesium.Color.RED.withAlpha(0.3));
  }
}
