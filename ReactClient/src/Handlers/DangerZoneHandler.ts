import { DangerZoneEntityManager } from "../DangerZonePanel/DangerZoneEntityManager";
import * as Cesium from "cesium";
import type { DangerZone, DangerZoneError } from "../Messages/AllTypes";
import { toast } from "react-toastify";
import { DangerZoneManager } from "../Managers/DangerZoneManager";

export class DangerZoneHandler{
    private static instance: DangerZoneHandler | null = null;
    private dangerZoneManager: DangerZoneManager
    private dangerZoneEntityManager: DangerZoneEntityManager
    private constructor(viewer: Cesium.Viewer) {
        this.dangerZoneManager = DangerZoneManager.getInstance();
        this.dangerZoneEntityManager = DangerZoneEntityManager.GetInstance(viewer);
    }

    public static getInstance(viewer: Cesium.Viewer): DangerZoneHandler {
        if (this.instance === null) {
            this.instance = new DangerZoneHandler(viewer);
        }
        return this.instance;
    }
    
    
    HandleAddDangerZone(data: any){
        try {
            const dangerZone = data as DangerZone;
            this.AddDangerZone(dangerZone)
        } catch (err) {
            console.log("data could not be parsed to DangerZone");
        }
    }
    AddDangerZone(dangerZone: DangerZone){
        const isAdded = this.dangerZoneManager.tryAddDangerZone(dangerZone);
        if(isAdded){
            this.dangerZoneEntityManager.tryAddDangerZone(dangerZone);
            console.log(`danger zone ${dangerZone.zoneId} added successfully.`);
        }
        else
            console.log("error in HandleAddDangerZone. danger zone adding failed")
    }

    HandleRemoveDangerZone(data: any){
        try {
            const dangerZone = data as DangerZone;
            this.RemoveDangerZone(dangerZone)
        } catch (err) {
            console.log("data could not be parsed to DangerZone");
        }
    }

    RemoveDangerZone(dangerZone: DangerZone){
        const isRemoved = this.dangerZoneManager.tryRemoveDangerZone(dangerZone.zoneId);
        if(isRemoved){
            this.dangerZoneEntityManager.removeDangerZone(dangerZone.zoneId);
            console.log(`danger zone ${dangerZone.zoneId} removed successfully.`);
        }
        else
            console.log("error in HandleRemoveDangerZone. danger zone removing failed")
    }

    HandleEditDangerZone(data: any){
        try {
            const dangerZone = data as DangerZone;
            this.EditDangerZone(dangerZone);
            
        } catch (err) {
            console.log("data could not be parsed to DangerZone");
        }
    }

    EditDangerZone(dangerZone: DangerZone){
        const isEdited = this.dangerZoneManager.tryEditDangerZone(dangerZone);
        if(isEdited){
            this.dangerZoneEntityManager.editDangerZone(dangerZone);
            console.log(`danger zone ${dangerZone.zoneId} edited successfully.`);
        }
        else
            console.log("error in HandleEditDangerZone. danger zone editing failed")
    }

    HandleDangerZoneError(data: any){
        try {
            const dangerZoneError = data as DangerZoneError;
            const errorMsg = dangerZoneError.errorMsg;
            console.log("Danger zone error from server: " + errorMsg);
            toast.error(errorMsg);
        } catch (err) {
            console.log("data could not be parsed to DangerZoneError");
        }
    }
}