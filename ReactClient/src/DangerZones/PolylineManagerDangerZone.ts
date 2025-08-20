// EntityManager.ts
import * as Cesium from "cesium";
import type { GeoPoint } from "../Messages/AllTypes";

export class PolylineManagerDangerZone {
  private viewer: Cesium.Viewer;
  private polyline: Cesium.Entity | null = null;

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
  }

  RemoveEntity(){
    this.polyline = null;
  }
}
