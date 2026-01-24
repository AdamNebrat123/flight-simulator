import * as Cesium from "cesium";
import { JammerHandler } from "../Jamming/Handler/JammerHandler";
import type { Scenario, ScenarioError} from "../Messages/AllTypes";
import { ScenarioManager } from "../Scenarios/ScenarioManager";
import { toast } from "react-toastify/unstyled";
import { ZoneHandler } from "../Zones/ZoneHandler";

export class ScenarioHandler {
    private static instance: ScenarioHandler | null = null;
    private scenarioManager: ScenarioManager;
    private static jammerHandler: JammerHandler;
    private static zoneHandler : ZoneHandler;

    private constructor() {
        this.scenarioManager = ScenarioManager.getInstance();
    }

    public static getInstance(viewer: Cesium.Viewer): ScenarioHandler {
        if (this.instance === null) {
            this.instance = new ScenarioHandler();
            this.jammerHandler =  JammerHandler.getInstance(viewer)
            this.zoneHandler =  ZoneHandler.getInstance(viewer)
        }
        return this.instance;
    }

    HandleAddScenario(data: any) {
        try {
            const scenario = data as Scenario;
            this.AddScenario(scenario);
        } catch (err) {
            console.log("data could not be parsed to PlanesTrajectoryPointsScenario");
        }
    }

    AddScenario(scenario: Scenario) {
        const isAdded = this.scenarioManager.tryAddScenario(scenario);
        if (isAdded)
        {
            ScenarioHandler.zoneHandler.HandleAddZones(scenario.zones);
            ScenarioHandler.jammerHandler.HandleAddJammers(scenario.jammers)
        }
        else
            console.log("Error in HandleAddScenario. Scenario adding failed.");
    }

    HandleRemoveScenario(data: any) {
        try {
            const scenario = data as Scenario;
            this.RemoveScenario(scenario);
            ScenarioHandler.zoneHandler.HandleRemoveZones(scenario.zones);
            ScenarioHandler.jammerHandler.HandleRemoveJammers(scenario.jammers)
        } catch (err) {
            console.log("data could not be parsed to PlanesTrajectoryPointsScenario");
        }
    }

    RemoveScenario(scenario: Scenario) {
        const isRemoved = this.scenarioManager.tryRemoveScenario(scenario.scenarioId);
        if (isRemoved)
            console.log(`Scenario ${scenario.scenarioId} removed successfully.`);
        else
            console.log("Error in HandleRemoveScenario. Scenario removing failed.");
    }

    HandleEditScenario(data: any) {
        try {
            const scenario = data as Scenario;
            this.EditScenario(scenario);
        } catch (err) {
            console.log("data could not be parsed to PlanesTrajectoryPointsScenario");
        }
    }

    EditScenario(scenario: Scenario) {
        const isEdited = this.scenarioManager.tryEditScenario(scenario);
        if (isEdited)
            console.log(`Scenario ${scenario.scenarioId} edited successfully.`);
        else
            console.log("Error in HandleEditScenario. Scenario editing failed.");
    }
    HandleScenarioError(data: any){
        try {
            const scenarioError = data as ScenarioError;
            const errorMsg = scenarioError.errorMsg;
            console.log("Scenario error from server: " + errorMsg);
            toast.error(errorMsg);
        } catch (err) {
            console.log("data could not be parsed to ScenarioError");
        }
    }
}