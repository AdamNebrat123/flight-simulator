import type { Scenario } from "../Messages/AllTypes";

export class ScenarioManager {
    private static instance: ScenarioManager | null = null;
    private scenarioIdToScenario: Map<string, Scenario>;

    private constructor() {
        this.scenarioIdToScenario = new Map<string, Scenario>();
    }

    public static getInstance(): ScenarioManager {
        if (this.instance === null) {
            this.instance = new ScenarioManager();
        }
        return this.instance;
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
        return true;
    }

    tryRemoveScenario(scenarioId: string): boolean {
        if (!scenarioId) return false;
        return this.scenarioIdToScenario.delete(scenarioId);
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