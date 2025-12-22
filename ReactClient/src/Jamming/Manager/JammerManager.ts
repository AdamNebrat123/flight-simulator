import type { Jammer } from "../Jammer/Jammer";

export class JammersManager {
    private static instance: JammersManager | null = null;
    private jammerIdToJammer: Map<string, Jammer>;
    private listeners: ((jammers: Jammer[]) => void)[] = [];

    private constructor() {
        this.jammerIdToJammer = new Map<string, Jammer>();
    }
    public subscribe(cb: (jammers: Jammer[]) => void): () => void {
            this.listeners.push(cb);
            // unsubscribe function
            return () => {
                this.listeners = this.listeners.filter(l => l !== cb);
            };
        }

        private notify() {
            const snapshot = this.getAllJammers();
            this.listeners.forEach(cb => cb(snapshot));
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
        this.notify();
        return true;
    }

    tryRemoveJammer(jammerId: string): boolean {
        if (!jammerId) return false;
        const removed = this.jammerIdToJammer.delete(jammerId);
        if (removed) this.notify();
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
        this.notify();
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
