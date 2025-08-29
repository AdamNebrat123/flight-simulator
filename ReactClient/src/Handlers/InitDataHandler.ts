import * as Cesium from "cesium";
import { DangerZoneHandler } from "./DangerZoneHandler";
import type { InitData } from "../Messages/AllTypes";
import { ScenarioHandler } from "./ScenarioHandler";

export function handleInitData(data: any, viewer : Cesium.Viewer){
    try {
        const initData = data as InitData;

        // save the danger zones
        const dangerZones = initData.dangerZones;
        const dangerZoneHandler = DangerZoneHandler.getInstance(viewer);
        for(const dangerZone of dangerZones){
            dangerZoneHandler.AddDangerZone(dangerZone)
        }

        // save the scenarios
        const scenarios = initData.scenarios;
        const scenarioHandler = ScenarioHandler.getInstance();
        for(const scenario of scenarios){
            scenarioHandler.AddScenario(scenario)
        }

    } catch (err) {
        console.log("data could not be parsed to InitData");
    }

    
}