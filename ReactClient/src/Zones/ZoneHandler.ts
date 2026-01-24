import { ZoneEntityManager } from "./ZoneEntityManager";
import * as Cesium from "cesium";
import type { DangerZone, ZoneError as ZoneError, Zone } from "../Messages/AllTypes";
import { toast } from "react-toastify";
import { ZoneManager } from "./ZoneManager";

export class ZoneHandler{
    private static instance: ZoneHandler | null = null;
    private zoneManager: ZoneManager
    private zoneEntityManager: ZoneEntityManager
    private constructor(viewer: Cesium.Viewer) {
        this.zoneManager = ZoneManager.getInstance();
        this.zoneEntityManager = ZoneEntityManager.GetInstance(viewer);
    }

    public static getInstance(viewer: Cesium.Viewer): ZoneHandler {
        if (this.instance === null) {
            this.instance = new ZoneHandler(viewer);
        }
        return this.instance;
    }
    
    
    HandleAddZone(data: any){
        try {
            const zone = data as Zone;
            this.AddZone(zone)
        } catch (err) {
            console.log("data could not be parsed toZone");
        }
    }
    AddZone(zone: Zone){
        
            this.zoneEntityManager.tryAddZone(zone);
            console.log(` zone ${zone.zoneName} added successfully.`);
    }

    HandleRemoveZone(data: any){
        try {
            const zone = data as Zone;
            this.RemoveZone(zone)
        } catch (err) {
            console.log("data could not be parsed to Zone");
        }
    }

    RemoveZone(zone: Zone){

            this.zoneEntityManager.removeZone(zone.zoneName);
        console.log(`zone ${zone.zoneName} removed successfully.`);
    }

    HandleEditZone(data: any){
        try {
            const zone = data as Zone;
            this.EditZone(zone);
            
        } catch (err) {
            console.log("data could not be parsed to Zone");
        }
    }

    EditZone(zone: Zone){

        this.zoneEntityManager.editZone(zone);
        console.log(`danger zone ${zone.zoneName} edited successfully.`);
    }

    HandleZoneError(data: any){
        try {
            const zoneError = data as ZoneError;
            const errorMsg = zoneError.errorMsg;
            console.log("zone error from server: " + errorMsg);
            toast.error(errorMsg);
        } catch (err) {
            console.log("data could not be parsed to ZoneError");
        }
    }
}