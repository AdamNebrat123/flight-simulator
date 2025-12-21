import * as Cesium from "cesium";
import type { Jammer } from "../Jammer/Jammer";
import type { Frequency } from "../Jammer/JammerRelatedEnums";

export class JammerEntity {
  private viewer: Cesium.Viewer | null;
  private entity: Cesium.Entity | null;
  private jammer: Jammer;

  constructor(viewer: Cesium.Viewer, jammer: Jammer) {
    this.viewer = viewer;
    this.entity = null;
    this.jammer = jammer;
  }

  setJammer(jammer: Jammer) {
    this.jammer = jammer;
  }

  getJammer(): Jammer {
    return this.jammer;
  }

  setEntityNull() {
    this.entity = null;
  }

  removeEntity() {
    if (this.entity) {
      this.viewer?.entities.remove(this.entity);
      this.entity = null;
    }
  }

  getEntity(): Cesium.Entity | null {
    return this.entity;
  }

  // update position
  updatePosition(latitude: number, longitude: number) {
    this.jammer.position.latitude = latitude;
    this.jammer.position.longitude = longitude;

  }

  // update radius
  updateRadius(radius: number) {
    this.jammer.radius = radius;
  }

  // update frequencies
  updateFrequencies(frequencies: Frequency[]) {
    this.jammer.supportedFrequencies = frequencies;
  }
}
