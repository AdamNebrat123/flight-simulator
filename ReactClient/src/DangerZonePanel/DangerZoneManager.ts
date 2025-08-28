import { toast } from "react-toastify";
import type { DangerZone } from "../Messages/AllTypes";

export class DangerZoneManager {
    private static instance: DangerZoneManager | null = null;
    private zoneIdToDangerZone: Map<string, DangerZone>;

     private constructor() {
        this.zoneIdToDangerZone = new Map<string, DangerZone>();
    }

    public static getInstance(): DangerZoneManager {
        if (this.instance === null) {
            this.instance = new DangerZoneManager();
        }
        return this.instance;
    }

    tryAddDangerZone(zone: DangerZone): boolean {
        if (!zone || !zone.zoneId) {
            toast.error("Invalid DangerZone or missing zoneId");
            return false;
        }

        if (this.zoneIdToDangerZone.has(zone.zoneId)) {
            toast.error(`Zone with id ${zone.zoneId} already exists`);
            return false;
        }

        this.zoneIdToDangerZone.set(zone.zoneId, zone);
        return true;
    }

    tryRemoveDangerZone(zoneId: string): boolean {
        if (!zoneId) return false;
        return this.zoneIdToDangerZone.delete(zoneId);
    }

    tryEditDangerZone(zone: DangerZone): boolean {
    if (!zone || !zone.zoneId) {
        console.log("Invalid DangerZone or missing zoneId");
        return false;
    }

    if (!this.zoneIdToDangerZone.has(zone.zoneId)) {
        console.log(`Zone with id ${zone.zoneId} does not exist`);
        return false;
    }

    this.zoneIdToDangerZone.set(zone.zoneId, zone);
    return true;
}

    getDangerZone(zoneId: string): DangerZone | undefined {
        if (!zoneId) return undefined;
        return this.zoneIdToDangerZone.get(zoneId);
    }

    getAllDangerZones(): DangerZone[] {
        return Array.from(this.zoneIdToDangerZone.values());
    }

    getAllDangerZoneIds(): string[] {
        return Array.from(this.zoneIdToDangerZone.keys());
    }

    clearAll(): void {
        this.zoneIdToDangerZone.clear();
    }
}