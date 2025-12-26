import { toast } from "react-toastify";
import type { DangerZone, GeoPoint, Zone } from "../Messages/AllTypes";
import { ZoneTypeEnum } from "../Messages/ZoneTypeEnum";

export class ZoneManager {
    private static instance: ZoneManager | null = null;
    private zoneIdToZone: Map<string, Zone>;

    private constructor() {
        this.zoneIdToZone = new Map<string, Zone>();
    }

    public static getInstance(): ZoneManager {
        if (this.instance === null) {
            this.instance = new ZoneManager();
        }
        return this.instance;
    }

    tryAddZone(zone: Zone): boolean {
        if (!zone || !zone.zoneId) {
            toast.error("Invalid Zone or missing zoneId");
            return false;
        }

        if (this.zoneIdToZone.has(zone.zoneId)) {
            toast.error(`Zone with id ${zone.zoneId} already exists`);
            return false;
        }

        this.zoneIdToZone.set(zone.zoneId, zone);
        return true;
    }

    tryRemoveZone(zoneId: string): boolean {
        if (!zoneId) return false;
        const removed = this.zoneIdToZone.delete(zoneId);
        return removed;
    }


    getZone(zoneId: string): Zone | undefined {
        if (!zoneId) return undefined;
        return this.zoneIdToZone.get(zoneId);
    }

    getAllZones(): Zone[] {
        return Array.from(this.zoneIdToZone.values());
    }

    getAllZoneIds(): string[] {
        return Array.from(this.zoneIdToZone.keys());
    }

    clearAll(): void {
        this.zoneIdToZone.clear();
    }
}
