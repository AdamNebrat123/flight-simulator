// EntityManager.ts
import * as Cesium from "cesium";
import type { GeoPoint } from "../Messages/AllTypes";

export class PointEntityManager {
  private viewer: Cesium.Viewer;
  private pointToEntityMap = new Map<GeoPoint, Cesium.Entity>();

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
  }

  // Adds an Entity to the point, if it doesn't exist
  addEntityForPoint(point: GeoPoint) {
    if (this.pointToEntityMap.has(point)) return;

    const entity = this.viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(point.longitude, point.latitude, point.altitude),
        point: {
            pixelSize: 5,
            color: Cesium.Color.RED,
            outlineColor: Cesium.Color.WHITESMOKE.withAlpha(0.8),
            outlineWidth: 2,
        }
    });

    this.pointToEntityMap.set(point, entity);
  }

  // Updates Entity for point
  updateEntityPosition(point: GeoPoint) {
    const entity = this.pointToEntityMap.get(point);
    const cartesian = Cesium.Cartesian3.fromDegrees(point.longitude, point.latitude, point.altitude);
    const positionProperty = new Cesium.ConstantPositionProperty(cartesian);
    if (entity) {
      entity.position = positionProperty;
    }
  }

  // Removes all Entities
  removeAllEntities() {
    for (const entity of this.pointToEntityMap.values()) {
      this.viewer.entities.remove(entity);
    }
    this.pointToEntityMap.clear();
  }
}
