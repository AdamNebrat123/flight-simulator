import type { Scenario } from "../Messages/AllTypes";

export class ScenarioManager {
    private static instance: ScenarioManager | null = null;
    private scenarioIdToScenario: Map<string, Scenario>;
    private listeners: ((scenarios: Scenario[]) => void)[] = [];

    private constructor() {
        this.scenarioIdToScenario = new Map<string, Scenario>();
    }

    public static getInstance(): ScenarioManager {
        if (this.instance === null) {
            this.instance = new ScenarioManager();
        }
        return this.instance;
    }

    public subscribe(cb: (scenarios: Scenario[]) => void): () => void {
        this.listeners.push(cb);
        // unsubscribe function
        return () => {
            this.listeners = this.listeners.filter(l => l !== cb);
        };
    }

    private notify() {
        const snapshot = this.getAllScenarios();
        this.listeners.forEach(cb => cb(snapshot));
    }

    tryAddScenario(scenario: Scenario): boolean {
        if (!scenario || !scenario.scenarioId) {
            console.error("Invalid Scenario or missing scenarioId");
            return false;
        }

        if (this.scenarioIdToScenario.has(scenario.scenarioId)) {
            console.error(`Scenario with id ${scenario.scenarioId} already exists`);
            return false;
        }

        this.scenarioIdToScenario.set(scenario.scenarioId, scenario);
        this.notify();
        return true;
    }

    tryRemoveScenario(scenarioId: string): boolean {
        if (!scenarioId) return false;
        const removed = this.scenarioIdToScenario.delete(scenarioId);
        if (removed) this.notify();
        return removed;
    }

    tryEditScenario(scenario: Scenario): boolean {
        if (!scenario || !scenario.scenarioId) {
            console.error("Invalid Scenario or missing scenarioId");
            return false;
        }

        if (!this.scenarioIdToScenario.has(scenario.scenarioId)) {
            console.error(`Scenario with id ${scenario.scenarioId} does not exist`);
            return false;
        }

        this.scenarioIdToScenario.set(scenario.scenarioId, scenario);
        this.notify();
        return true;
    }

    getScenario(scenarioId: string): Scenario | undefined {
        if (!scenarioId) return undefined;
        return this.scenarioIdToScenario.get(scenarioId);
    }

    getAllScenarios(): Scenario[] {
        return Array.from(this.scenarioIdToScenario.values());
    }

    getAllScenarioIds(): string[] {
        return Array.from(this.scenarioIdToScenario.keys());
    }
}
