import * as Cesium from "cesium";
import type { GeoPoint, Zone } from "../Messages/AllTypes";
import { ZoneOptionsManager } from "./ZoneOptions";

export class ZoneEntity {
  private viewer: Cesium.Viewer | null;
  private entity: Cesium.Entity | null;
  private zone: Zone;

  constructor(
    viewer: Cesium.Viewer,
    zone: Zone
  ) {
    this.viewer = viewer;
    this.entity = null;
    this.zone = zone;
  }

  setZone(zone: Zone){
    this.zone = zone;
  }
  tryCreatePolygon(){
    if(this.entity !== null || this.zone === null)
      return; // entity already exists.

    const zoneOptions = ZoneOptionsManager.getZoneOptionsByString(this.zone.zoneType);
    const color = zoneOptions!.color;
    const oppacity = zoneOptions!.oppacity ;

    // If there are not enough points, don't create the polygon itself yet
    this.entity = this.viewer!.entities.add({
      name: this.zone.zoneName,
      polygon: this.zone.points.length >= 3
        ? {
            hierarchy: Cesium.Cartesian3.fromDegreesArray(
              this.zone.points.flatMap((p) => [p.longitude, p.latitude])
            ),
            perPositionHeight: true,
            height: this.zone.bottomHeight,
            extrudedHeight: this.zone.topHeight,
            material: color.withAlpha(oppacity),
            outline: true,
            outlineColor: color,
          }
        : undefined
    });
  }
  UpdateZonePositions(positions: GeoPoint[]) {
    this.zone.points = positions;
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
      const zoneOptions = ZoneOptionsManager.getZoneOptionsByString(this.zone.zoneType);
      const color = zoneOptions ? zoneOptions.color : Cesium.Color.RED;
      const oppacity = zoneOptions ? zoneOptions.oppacity : 0.3;
      // If the polygon doesn't exist yet, create it
      this.entity.polygon = new Cesium.PolygonGraphics({
        hierarchy: new Cesium.ConstantProperty(new Cesium.PolygonHierarchy(updatedPositions)),
        perPositionHeight: true,
        height: this.zone.bottomHeight,
        extrudedHeight: this.zone.topHeight,
        material: color.withAlpha(oppacity),
        outline: true,
        outlineColor: color,
      });
    } else {
      // If the polygon already exists, update the hierarchy
      this.entity.polygon.hierarchy = new Cesium.ConstantProperty(
        new Cesium.PolygonHierarchy(updatedPositions)
      );
    }
  }

  UpdateZoneBottomHeight(bottomHeight: number){
    this.zone.bottomHeight = bottomHeight;
    if (!this.entity || !this.entity.polygon) return;
    this.entity.polygon.height = new Cesium.ConstantProperty(this.zone.bottomHeight);
  }

  UpdateZoneTopHeight(topHeight: number){
    this.zone.topHeight = topHeight
    if (!this.entity || !this.entity.polygon) return;
    this.entity.polygon.extrudedHeight = new Cesium.ConstantProperty(this.zone.topHeight);
  }
  UpdateZoneName(zoneName: string) {
    this.zone.zoneName = zoneName
    if (!this.entity) return;
    this.entity.name = this.zone.zoneName;
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