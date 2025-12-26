import * as Cesium from "cesium";
import { toast } from "react-toastify";
import { JammersManager } from "../Manager/JammerManager";
import { JammerEntityManager } from "../EntitiesManagment/JammerEntityManager";
import type { Jammer } from "../Jammer/Jammer";
import type { JammerError } from "../../Messages/AllTypes";

export class JammerHandler {
  private static instance: JammerHandler | null = null;
  private jammerManager: JammersManager;
  private jammerEntityManager: JammerEntityManager;

  private constructor(viewer: Cesium.Viewer) {
    this.jammerManager = JammersManager.getInstance();
    this.jammerEntityManager = JammerEntityManager.GetInstance(viewer);
  }

  public static getInstance(viewer: Cesium.Viewer): JammerHandler {
    if (this.instance === null) {
      this.instance = new JammerHandler(viewer);
    }
    return this.instance;
  }


  AddJammer(jammer: Jammer) {
    const isAdded = this.jammerManager.tryAddJammer(jammer);
    if (isAdded) {
      this.jammerEntityManager.tryAddJammer(jammer);
      console.log(`Jammer ${jammer.id} added successfully.`);
    } else {
      console.log("error in HandleAddJammer. Jammer adding failed");
    }
  }


  RemoveJammer(jammer: Jammer) {
    const isRemoved = this.jammerManager.tryRemoveJammer(jammer.id);
    if (isRemoved) {
      this.jammerEntityManager.removeJammer(jammer.id);
      console.log(`Jammer ${jammer.id} removed successfully.`);
    } else {
      console.log("error in HandleRemoveJammer. Jammer removing failed");
    }
  }

  RemoveAllJammers(){
    const jammers = this.jammerManager.getAllJammers();

    for (const jammer of jammers) {
        this.RemoveJammer(jammer);
    }
  }
}
