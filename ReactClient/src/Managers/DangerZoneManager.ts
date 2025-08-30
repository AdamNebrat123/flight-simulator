import { toast } from "react-toastify";
import type { DangerZone } from "../Messages/AllTypes";

export class DangerZoneManager {
    private static instance: DangerZoneManager | null = null;
    private zoneIdToDangerZone: Map<string, DangerZone>;
    private listeners: ((zones: DangerZone[]) => void)[] = [];

    private constructor() {
        this.zoneIdToDangerZone = new Map<string, DangerZone>();
    }

    public static getInstance(): DangerZoneManager {
        if (this.instance === null) {
            this.instance = new DangerZoneManager();
        }
        return this.instance;
    }

    public subscribe(cb: (zones: DangerZone[]) => void): () => void {
        this.listeners.push(cb);
        return () => {
            this.listeners = this.listeners.filter(l => l !== cb);
        };
    }

    private notify() {
        const snapshot = this.getAllDangerZones();
        this.listeners.forEach(cb => cb(snapshot));
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
        this.notify();
        return true;
    }

    tryRemoveDangerZone(zoneId: string): boolean {
        if (!zoneId) return false;
        const removed = this.zoneIdToDangerZone.delete(zoneId);
        if (removed) this.notify();
        return removed;
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
        this.notify();
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
        this.notify();
    }
}
