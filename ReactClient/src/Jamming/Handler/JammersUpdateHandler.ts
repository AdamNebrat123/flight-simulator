import * as Cesium from "cesium";
import type { Jammer } from "../Jammer/Jammer";
import { JammerEntityManager } from "../EntitiesManagment/JammerEntityManager";
import type { JammersUpdate } from "../../Messages/AllTypes";
import { JammersManager } from "../Manager/JammerManager";

export class JammersUpdateHandler {
  private static instance: JammersUpdateHandler | null = null;
  private jammerEntityManager: JammerEntityManager;
  private jammerManager: JammersManager;


  private constructor(viewer: Cesium.Viewer) {
    this.jammerEntityManager = JammerEntityManager.GetInstance(viewer);
    this.jammerManager = JammersManager.getInstance();
  }

  public static GetInstance(viewer: Cesium.Viewer): JammersUpdateHandler {
    if (!this.instance) {
      this.instance = new JammersUpdateHandler(viewer);
    }
    return this.instance;
  }

  public HandleJammersUpdate(data: any) {
    try {
      const jammersUpdate = data as JammersUpdate;

      console.log(jammersUpdate)
      for (const jammer of jammersUpdate.jammers) {
        this.applyJammerUpdate(jammer);
      }
    } catch (err) {
      console.error("Failed to handle JammersUpdate", err);
    }
  }

  private applyJammerUpdate(jammer: Jammer) {
    const jammerEntity = this.jammerEntityManager.getJammerEntity(jammer.id);
    if (!jammerEntity) return;

    this.jammerManager.setJammer(jammer);
    this.jammerEntityManager.setJammer(jammer);

    switch (jammer.jamMode) {
      case "Omnidirectional":
        this.startOmnidirectionalJamming(jammerEntity);
        break;

      case "Directional":
        this.startDirectionalJamming(jammerEntity, jammer.directionDegrees);
        break;

      case "None":
        this.stopJamming(jammerEntity);
        break;
        
      default:
        break;
    }
  }

  private stopJamming(jammerEntity: any) {
    jammerEntity.hideOmni();
    jammerEntity.hideDirectional();
  }

  private startOmnidirectionalJamming(jammerEntity: any) {
    jammerEntity.hideDirectional();
    jammerEntity.showOmni();
  }

  private startDirectionalJamming(jammerEntity: any, directionDeg: number | null | undefined) {
    if(!directionDeg) return;
    jammerEntity.hideOmni();
    jammerEntity.showDirectional(directionDeg);
  }
}
