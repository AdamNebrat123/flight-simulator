import * as Cesium from "cesium";
import type { GeoPoint } from "../Messages/AllTypes";

export class DangerZoneEntity {
  private viewer: Cesium.Viewer | null;
  private entity: Cesium.Entity | null;
  private points: GeoPoint[];
  private bottomHeight: number;
  private topHeight: number;
  private name: string;

  constructor(
    viewer: Cesium.Viewer,
    positions: GeoPoint[],
    bottomHeight: number,
    topHeight: number,
    name: string
  ) {
    this.viewer = viewer;
    this.points = positions;
    this.bottomHeight = bottomHeight;
    this.topHeight = topHeight;
    this.name = name;
    
    // If there are not enough points, don't create a polygon yet
    this.entity = viewer.entities.add({
      name,
      polygon: positions.length >= 3 ? {
        hierarchy: Cesium.Cartesian3.fromDegreesArray(
          positions.flatMap((p) => [p.longitude, p.latitude])
        ),
        perPositionHeight: true,
        height: bottomHeight,
        extrudedHeight: topHeight,
        material: Cesium.Color.RED.withAlpha(0.3),
        outline: true,
        outlineColor: Cesium.Color.RED,
      } : undefined
    });
  }

  UpdateZonePositions(positions: GeoPoint[]) {
    this.points = positions;
    if (!this.entity) return;

    // If there are not enough points, remove the polygon if it exists
    if (positions.length < 3) {
      if (this.entity.polygon) {
        this.entity.polygon = undefined;
      }
      return;
    }

    const updatedPositions = Cesium.Cartesian3.fromDegreesArray(
      positions.flatMap((p) => [p.longitude, p.latitude])
    );
    if (!this.entity.polygon) {
      // If the polygon doesn't exist yet, create it
      this.entity.polygon = new Cesium.PolygonGraphics({
        hierarchy: new Cesium.ConstantProperty(new Cesium.PolygonHierarchy(updatedPositions)),
        perPositionHeight: true,
        height: this.bottomHeight,
        extrudedHeight: this.topHeight,
        material: Cesium.Color.RED.withAlpha(0.3),
        outline: true,
        outlineColor: Cesium.Color.RED,
      });
    } else {
      // If the polygon already exists, update the hierarchy
      this.entity.polygon.hierarchy = new Cesium.ConstantProperty(
        new Cesium.PolygonHierarchy(updatedPositions)
      );
    }
  }

  UpdateZoneBottomHeight(bottomHeight: number){
    this.bottomHeight = bottomHeight;
    if (!this.entity || !this.entity.polygon) return;
    this.entity.polygon.height = new Cesium.ConstantProperty(this.bottomHeight);
  }

  UpdateZoneTopHeight(topHeight: number){
    this.topHeight = topHeight
    if (!this.entity || !this.entity.polygon) return;
    this.entity.polygon.extrudedHeight = new Cesium.ConstantProperty(this.topHeight);
  }
  UpdateZoneName(name: string) {
    this.name = name
    if (!this.entity) return;
    this.entity.name = this.name;
  }
  SetEntityNull(){
    this.entity = null;
  }
  RemoveEntity(){
    this.viewer?.entities.remove(this.entity!)
  }
}