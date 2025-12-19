import * as Cesium from "cesium";
import type { DangerZone, GeoPoint } from "../Messages/AllTypes";

export class DangerZoneEntity {
  private viewer: Cesium.Viewer | null;
  private entity: Cesium.Entity | null;
  private dangerZone: DangerZone;

  constructor(
    viewer: Cesium.Viewer,
    dangerZone: DangerZone
  ) {
    this.viewer = viewer;
    this.entity = null;
    this.dangerZone = dangerZone;
  }

  tryCreatePolygon(){
    if(this.entity !== null || this.dangerZone === null)
      return; // entity already exists.
    // If there are not enough points, don't create the polygon itself yet
    this.entity = this.viewer!.entities.add({
      name: this.dangerZone.zoneName,
      polygon: this.dangerZone.points.length >= 3
        ? {
            hierarchy: Cesium.Cartesian3.fromDegreesArray(
              this.dangerZone.points.flatMap((p) => [p.longitude, p.latitude])
            ),
            perPositionHeight: true,
            height: this.dangerZone.bottomHeight,
            extrudedHeight: this.dangerZone.topHeight,
            material: Cesium.Color.RED.withAlpha(0.3),
            outline: true,
            outlineColor: Cesium.Color.RED,
          }
        : undefined
    });
  }
  UpdateZonePositions(positions: GeoPoint[]) {
    this.dangerZone.points = positions;
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
        height: this.dangerZone.bottomHeight,
        extrudedHeight: this.dangerZone.topHeight,
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
    this.dangerZone.bottomHeight = bottomHeight;
    if (!this.entity || !this.entity.polygon) return;
    this.entity.polygon.height = new Cesium.ConstantProperty(this.dangerZone.bottomHeight);
  }

  UpdateZoneTopHeight(topHeight: number){
    this.dangerZone.topHeight = topHeight
    if (!this.entity || !this.entity.polygon) return;
    this.entity.polygon.extrudedHeight = new Cesium.ConstantProperty(this.dangerZone.topHeight);
  }
  UpdateZoneName(zoneName: string) {
    this.dangerZone.zoneName = zoneName
    if (!this.entity) return;
    this.entity.name = this.dangerZone.zoneName;
  }
  SetEntityNull(){
    this.entity = null;
  }
  RemoveEntity(){
    this.viewer?.entities.remove(this.entity!)
  }
  GetEntity(): Cesium.Entity | null {
    return this.entity;
  }

  showEntity(){
    if(!this.entity)
      return
    this.entity.show = true;
  }

  hideEntity(){
    if(!this.entity)
      return
    this.entity.show = false;
  }
}