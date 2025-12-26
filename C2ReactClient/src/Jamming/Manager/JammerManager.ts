import type { Jammer } from "../Jammer/Jammer";

export class JammersManager {
    private static instance: JammersManager | null = null;
    private jammerIdToJammer: Map<string, Jammer>;

    private constructor() {
        this.jammerIdToJammer = new Map<string, Jammer>();
    }
    
    public static getInstance(): JammersManager {
        if (this.instance === null) {
            this.instance = new JammersManager();
        }
        return this.instance;
    }
    public setJammer(jammer: Jammer): boolean {
        if (!jammer || !jammer.id) return false;
        if (!this.jammerIdToJammer.has(jammer.id)) return false;

        this.jammerIdToJammer.set(jammer.id, jammer);
        return true;
    }

    tryAddJammer(jammer: Jammer): boolean {
        if (!jammer || !jammer.id) {
            console.error("Invalid Jammer or missing id");
            return false;
        }

        if (this.jammerIdToJammer.has(jammer.id)) {
            console.error(`Jammer with id ${jammer.id} already exists`);
            return false;
        }

        this.jammerIdToJammer.set(jammer.id, jammer);
        return true;
    }

    tryRemoveJammer(jammerId: string): boolean {
        if (!jammerId) return false;
        const removed = this.jammerIdToJammer.delete(jammerId);
        return removed;
    }

    tryEditJammer(jammer: Jammer): boolean {
        if (!jammer || !jammer.id) {
            console.error("Invalid Jammer or missing id");
            return false;
        }

        if (!this.jammerIdToJammer.has(jammer.id)) {
            console.error(`Jammer with id ${jammer.id} does not exist`);
            return false;
        }

        this.jammerIdToJammer.set(jammer.id, jammer);
        return true;
    }

    getJammer(jammerId: string): Jammer | undefined {
        if (!jammerId) return undefined;
        return this.jammerIdToJammer.get(jammerId);
    }

    getAllJammers(): Jammer[] {
        return Array.from(this.jammerIdToJammer.values());
    }

    getAllJammerIds(): string[] {
        return Array.from(this.jammerIdToJammer.keys());
    }
}
