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

  private constructor() {
    this.jammerManager = JammersManager.getInstance();
    this.jammerEntityManager = JammerEntityManager.GetInstance();
  }

  public static getInstance(): JammerHandler {
    if (this.instance === null) {
      this.instance = new JammerHandler();
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
    const isAdded = this.jammerManager.tryAddJammer(jammer);
    if (isAdded) {
      this.jammerEntityManager.tryAddJammer(jammer);
      console.log(`Jammer ${jammer.id} added successfully.`);
    } else {
      console.log("error in HandleAddJammer. Jammer adding failed");
    }
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
    const isRemoved = this.jammerManager.tryRemoveJammer(jammer.id);
    if (isRemoved) {
      this.jammerEntityManager.removeJammer(jammer.id);
      console.log(`Jammer ${jammer.id} removed successfully.`);
    } else {
      console.log("error in HandleRemoveJammer. Jammer removing failed");
    }
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
    const isEdited = this.jammerManager.tryEditJammer(jammer);
    if (isEdited) {
      this.jammerEntityManager.editJammer(jammer);
      console.log(`Jammer ${jammer.id} edited successfully.`);
    } else {
      console.log("error in HandleEditJammer. Jammer editing failed");
    }
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
