import { ZoneEntityManager } from "./ZoneEntityManager";
import * as Cesium from "cesium";
import type { Zone } from "../Messages/AllTypes";
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
    
    
    HandleUpdatedZones(data: any){
        try {
            // parse to zones object
            //then
            /*
            foreach(zone in zones)
                this.AddZone(zone)
            */
        } catch (err) {
            console.log("data could not be parsed toZone");
        }
    }
    HandleAddZone(zone: Zone){
        const isAdded = this.zoneManager.tryAddZone(zone);
        if(isAdded){
            this.zoneEntityManager.tryAddZone(zone);
            console.log(` zone ${zone.zoneId} added successfully.`);
        }
        else
            console.log("error in HandleAddZone.  zone adding failed")
    }

    RemoveAllZones() {
        const zones = this.zoneManager.getAllZones();

        for (const zone of zones) {
            this.RemoveZone(zone);
        }

        this.zoneManager.clearAll()
    }

    RemoveZone(zone: Zone){
        const isRemoved = this.zoneManager.tryRemoveZone(zone.zoneId);
        if(isRemoved){
            this.zoneEntityManager.removeZone(zone.zoneId);
            console.log(`zone ${zone.zoneId} removed successfully.`);
        }
        else
            console.log("error in HandleRemoveZone. zone removing failed")
    }
}