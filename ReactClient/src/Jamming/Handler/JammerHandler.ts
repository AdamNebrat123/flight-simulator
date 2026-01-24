import * as Cesium from "cesium";
import { toast } from "react-toastify";
import { JammersManager } from "../Manager/JammerManager";
import { JammerEntityManager } from "../EntitiesManagment/JammerEntityManager";
import type { JammerError } from "../../Messages/AllTypes";
import type { Jammer } from "../../Sensors/Jammer/Jammer";

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

  HandleAddJammer(data: any) {
    try {
      const jammer = data as Jammer;
      this.AddJammer(jammer);
    } catch (err) {
      console.log("data could not be parsed to Jammer");
    }
  }

  AddJammer(jammer: Jammer) {
      this.jammerEntityManager.tryAddJammer(jammer);
      console.log(`Jammer ${jammer.id} added successfully.`);
  }

  HandleRemoveJammer(data: any) {
    try {
      const jammer = data as Jammer;
      this.RemoveJammer(jammer);
    } catch (err) {
      console.log("data could not be parsed to Jammer");
    }
  }

  RemoveJammer(jammer: Jammer) {
      this.jammerEntityManager.removeJammer(jammer.id);
      console.log(`Jammer ${jammer.id} removed successfully.`);

  }

  HandleEditJammer(data: any) {
    try {
      const jammer = data as Jammer;
      this.EditJammer(jammer);
    } catch (err) {
      console.log("data could not be parsed to Jammer");
    }
  }

  EditJammer(jammer: Jammer) {
      this.jammerEntityManager.editJammer(jammer);
      console.log(`Jammer ${jammer.id} edited successfully.`);
  }

  HandleJammerError(data: any) {
    try {
      const jammerError = data as JammerError;
      const errorMsg = jammerError.errorMsg;
      console.log("Jammer error from server: " + errorMsg);
      toast.error(errorMsg);
    } catch (err) {
      console.log("data could not be parsed to JammerError");
    }
  }
}
