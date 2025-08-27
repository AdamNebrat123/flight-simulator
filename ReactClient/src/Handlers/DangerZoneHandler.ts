import { DangerZoneEntityManager } from "../DangerZonePanel/DangerZoneEntityManager";
import * as Cesium from "cesium";
import type { DangerZone, DangerZoneError } from "../Messages/AllTypes";
import { toast } from "react-toastify";
import { DangerZoneManager } from "../DangerZonePanel/DangerZoneManager";

export class DangerZoneHandler{
    private dangerZoneManager: DangerZoneManager
    private dangerZoneEntityManager: DangerZoneEntityManager
    constructor(viewer: Cesium.Viewer){
        this.dangerZoneManager = new DangerZoneManager();
        this.dangerZoneEntityManager = DangerZoneEntityManager.GetInstance(viewer);
    }
    
    HandleAddDangerZone(data: any){
        try {
            const dangerZone = data as DangerZone;
            const isAdded = this.dangerZoneManager.tryAddDangerZone(dangerZone);
            if(isAdded)
                this.dangerZoneEntityManager.tryAddDangerZone(dangerZone);
            else
                console.log("error in HandleAddDangerZone. danger zone adding failed")
        } catch (err) {
            console.log("data could not be parsed to DangerZone");
        }
    }

    HandleRemoveDangerZone(data: any){
        try {
            const dangerZone = data as DangerZone;
            this.dangerZoneManager.tryRemoveDangerZone(dangerZone.zoneId);
        } catch (err) {
            console.log("data could not be parsed to DangerZone");
        }
    }

    HandleEditDangerZone(data: any){
        try {
            const dangerZone = data as DangerZone;
            this.dangerZoneManager.tryEditDangerZone(dangerZone);
        } catch (err) {
            console.log("data could not be parsed to DangerZone");
        }
    }

    HandleDangerZoneError(data: any){
        try {
            const dangerZoneError = data as DangerZoneError;
            const errorMsg = dangerZoneError.errorMsg;
            toast.error(errorMsg);
        } catch (err) {
            console.log("data could not be parsed to DangerZoneError");
        }
    }
}