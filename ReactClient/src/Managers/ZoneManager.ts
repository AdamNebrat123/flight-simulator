import { toast } from "react-toastify";
import type { DangerZone, Zone } from "../Messages/AllTypes";

export class ZoneManager {
    private static instance: ZoneManager | null = null;
    private zoneIdToZone: Map<string, Zone>;
    private listeners: ((zones: Zone[]) => void)[] = [];

    private constructor() {
        this.zoneIdToZone = new Map<string, Zone>();
    }

    public static getInstance(): ZoneManager {
        if (this.instance === null) {
            this.instance = new ZoneManager();
        }
        return this.instance;
    }

    public subscribe(cb: (zones: Zone[]) => void): () => void {
        this.listeners.push(cb);
        return () => {
            this.listeners = this.listeners.filter(l => l !== cb);
        };
    }

    private notify() {
        const snapshot = this.getAllZones();
        this.listeners.forEach(cb => cb(snapshot));
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
        this.notify();
        return true;
    }

    tryRemoveZone(zoneId: string): boolean {
        if (!zoneId) return false;
        const removed = this.zoneIdToZone.delete(zoneId);
        if (removed) this.notify();
        return removed;
    }

    tryEditZone(zone: Zone): boolean {
        if (!zone || !zone.zoneId) {
            console.log("Invalid Zone or missing zoneId");
            return false;
        }

        if (!this.zoneIdToZone.has(zone.zoneId)) {
            console.log(`Zone with id ${zone.zoneId} does not exist`);
            return false;
        }

        this.zoneIdToZone.set(zone.zoneId, zone);
        this.notify();
        return true;
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
        this.notify();
    }
}
