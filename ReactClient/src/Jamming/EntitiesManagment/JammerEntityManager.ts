import * as Cesium from "cesium";
import { JammerEntity } from "./JammerEntity";
import type { Jammer } from "../Jammer/Jammer";

export class JammerEntityManager {
  private static instance: JammerEntityManager | null = null;

  private viewer: Cesium.Viewer;
  private jammerIdToEntity: Map<string, JammerEntity>;

  private constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
    this.jammerIdToEntity = new Map<string, JammerEntity>();
  }

  public static GetInstance(viewer?: Cesium.Viewer): JammerEntityManager {
    if (!JammerEntityManager.instance) {
      if (!viewer) {
        throw new Error(
          "Viewer must be provided for the first GetInstance call"
        );
      }
      JammerEntityManager.instance = new JammerEntityManager(viewer);
    }
    return JammerEntityManager.instance;
  }

  tryAddJammer(jammer: Jammer) {
    if (!jammer || !jammer.id) {
      console.error("Invalid Jammer or missing id");
      return;
    }

    if (this.jammerIdToEntity.has(jammer.id)) {
      console.error(`Jammer with id ${jammer.id} already exists`);
      return;
    }

    const jammerEntity = new JammerEntity(this.viewer, jammer);
    this.jammerIdToEntity.set(jammer.id, jammerEntity);
  }

  getJammerEntity(jammerId: string): JammerEntity | null {
    return this.jammerIdToEntity.get(jammerId) ?? null;
  }

  removeJammer(jammerId: string) {
    const jammerEntity = this.jammerIdToEntity.get(jammerId);
    if (jammerEntity) {
      jammerEntity.removeEntity();
      this.jammerIdToEntity.delete(jammerId);
    }
  }

  editJammer(jammer: Jammer) {
    if (!jammer || !jammer.id) {
      console.error("Invalid Jammer or missing id");
      return false;
    }

    const existingEntity = this.jammerIdToEntity.get(jammer.id);
    if (!existingEntity) {
      console.error(`Jammer with id ${jammer.id} does not exist`);
      return false;
    }

    // update the Jammer inside the entity
    existingEntity.setJammer(jammer);
    return true;
  }

  hideJammer(jammerId: string) {
    const jammerEntity = this.jammerIdToEntity.get(jammerId);
    if (!jammerEntity) return;
    const entity = jammerEntity.getEntity();
    if (entity) entity.show = false;
  }

  showJammer(jammerId: string) {
    const jammerEntity = this.jammerIdToEntity.get(jammerId);
    if (!jammerEntity) return;
    const entity = jammerEntity.getEntity();
    if (entity) entity.show = true;
  }

  getAllJammerIds(): string[] {
    return Array.from(this.jammerIdToEntity.keys());
  }

  clearAllJammers() {
    for (const jammerEntity of this.jammerIdToEntity.values()) {
      jammerEntity.removeEntity();
    }
    this.jammerIdToEntity.clear();
  }
}
