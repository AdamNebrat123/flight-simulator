import type { Drone, DronesInitData } from "../../Messages/AllTypes";
import { DroneEntityManager } from "./DroneEntityManager";
import * as Cesium from "cesium";
import { toast } from "react-toastify";

export class DroneHandler {
  private static instance: DroneHandler | null = null;
  private droneEntityManager: DroneEntityManager;

  private constructor(viewer: Cesium.Viewer) {
    this.droneEntityManager = DroneEntityManager.getInstance(viewer);
  }

  public static getInstance(viewer?: Cesium.Viewer): DroneHandler {
    if (!this.instance) {
      if (!viewer) {
        throw new Error("Viewer must be provided for the first getInstance call");
      }
      this.instance = new DroneHandler(viewer);
    }
    return this.instance;
  }

  public HandleRemoveDrone(data: any) {
    try {
      const drone = data as Drone;
      const isRemoved = this.droneEntityManager.removeDrone(drone.id);
      if (isRemoved) console.log(`Drone ${drone.id} removed successfully.`);
      else console.log(`Failed to remove drone ${drone.id}.`);
    } catch (err) {
      console.error("Data could not be parsed to Drone:", err);
    }
  }

  public HandleUpdateDrone(data: any) {
    try {
      const drone = data as Drone;

      // If the drone doesn't exist yet, create it first
      if (!this.droneEntityManager.getDroneEntity(drone.id)) {
        this.droneEntityManager.addDroneById(drone.id);
        console.log(`Drone ${drone.id} created because it did not exist.`);
      }

      const isEdited = this.droneEntityManager.editDrone(drone);
      if (isEdited) console.log(`Drone ${drone.id} updated successfully.`);
      else console.log(`Failed to update drone ${drone.id}.`);
    } catch (err) {
      console.error("Data could not be parsed to Drone:", err);
    }

  }

  public HandleDroneError(data: any) {
    try {
      const errorMsg = (data as { errorMsg: string }).errorMsg;
      console.log("Drone error from server: " + errorMsg);
      toast.error(errorMsg);
    } catch {
      console.error("Data could not be parsed to DroneError");
    }
  }

  public HandleDronesInitData(data: any) {
    try {
      const initData = data as DronesInitData;
      console.log("Handling InitData:", initData);

      // now DronesInitData contains only my drone ID
      if (initData.yourDroneId) {
        const entity = this.droneEntityManager.addDroneById(initData.yourDroneId);
        if (entity) console.log(`My drone ${initData.yourDroneId} created from InitData.`);
      }

      // Returns the ID of my drone
      return initData.yourDroneId;
    } catch (err) {
      console.error("Data could not be parsed to DronesInitData:", err);
      return null;
    }
  }

  public getDroneEntity(droneId: string): Cesium.Entity | null {
    return this.droneEntityManager.getDroneEntity(droneId);
  }

  public getAllDroneIds(): string[] {
    return this.droneEntityManager.getAllDroneIds();
  }

  public clearAllDrones() {
    this.droneEntityManager.clearAllDrones();
  }
}
