import type { Drone } from "../../Messages/AllTypes";
import { DroneEntityManager } from "./DroneEntityManager";
import * as Cesium from "cesium";
import { toast } from "react-toastify";

export class DroneHandler {
    private static instance: DroneHandler | null = null;
    private droneEntityManager: DroneEntityManager;

    private constructor(viewer: Cesium.Viewer) {
        this.droneEntityManager = DroneEntityManager.getInstance(viewer);
    }

    public static getInstance(viewer: Cesium.Viewer): DroneHandler {
        if (!this.instance) {
            this.instance = new DroneHandler(viewer);
        }
        return this.instance;
    }

    public HandleAddDrone(data: any) {
        try {
            const drone = data as Drone;
            const isAdded = this.droneEntityManager.tryAddDrone(drone);
            if (isAdded) console.log(`Drone ${drone.droneId} added successfully.`);
            else console.log(`Failed to add drone ${drone.droneId}.`);
        } catch (err) {
            console.log("Data could not be parsed to Drone:", err);
        }
    }

    public HandleRemoveDrone(data: any) {
        try {
            const drone = data as Drone;
            const isRemoved = this.droneEntityManager.removeDrone(drone.droneId);
            if (isRemoved) console.log(`Drone ${drone.droneId} removed successfully.`);
            else console.log(`Failed to remove drone ${drone.droneId}.`);
        } catch (err) {
            console.log("Data could not be parsed to Drone:", err);
        }
    }

    public HandleUpdateDrone(data: any) {
        try {
            const drone = data as Drone;
            const isEdited = this.droneEntityManager.editDrone(drone);
            if (isEdited) console.log(`Drone ${drone.droneId} updated successfully.`);
            else console.log(`Failed to update drone ${drone.droneId}.`);
        } catch (err) {
            console.log("Data could not be parsed to Drone:", err);
        }
    }

    public HandleDroneError(data: any) {
        try {
            const errorMsg = (data as { errorMsg: string }).errorMsg;
            console.log("Drone error from server: " + errorMsg);
            toast.error(errorMsg);
        } catch {
            console.log("Data could not be parsed to DroneError");
        }
    }
}
