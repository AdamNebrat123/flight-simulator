import { toast } from "react-toastify";
import type { DangerZone } from "../Messages/AllTypes";


export class DangerZoneManager{
    private zoneNameToDangerZone: Map<string, DangerZone>

    constructor(){
        this.zoneNameToDangerZone = new Map<string, DangerZone>();
    }

    tryAddDangerZone(zoneName: string, zone: DangerZone): boolean {
        if (this.zoneNameToDangerZone.has(zoneName)) {
            toast.error(zoneName + " - Zone name already exists")
            return false; // already exists
        }
        this.zoneNameToDangerZone.set(zoneName, zone);
        return true;
    }

    tryRemoveDangerZone(zoneName: string): boolean {
        return this.zoneNameToDangerZone.delete(zoneName);
    }

    getDangerZone(zoneName: string): DangerZone | undefined {
        return this.zoneNameToDangerZone.get(zoneName);
    }
    
    getAllDangerZonesNames(): string[] {
        return Array.from(this.zoneNameToDangerZone.keys());
    }

    clearAll(): void {
        this.zoneNameToDangerZone.clear();
    }
}