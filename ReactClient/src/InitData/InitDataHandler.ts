import * as Cesium from "cesium";
import { ZoneHandler } from "../Zones/ZoneHandler";
import type { InitData } from "../Messages/AllTypes";
import { ScenarioHandler } from "../Scenarios/ScenarioHandler";
import { JammerHandler } from "../Jamming/Handler/JammerHandler";

export function handleInitData(data: any, viewer : Cesium.Viewer){
    try {
        console.log(data);
        const initData = data as InitData;

        // save the danger zones
        /*
        const dangerZones = initData.zones;
        const dangerZoneHandler = ZoneHandler.getInstance(viewer);
        for(const dangerZone of dangerZones){
            dangerZoneHandler.AddZone(dangerZone)
        }
        */
        // save the scenarios
        const scenarios = initData.scenarios;
        const scenarioHandler = ScenarioHandler.getInstance();
        for(const scenario of scenarios){
            scenarioHandler.AddScenario(scenario)
        }

        // save the jammers
        /*
        const jammers = initData.jammers;
        const jammerHandler = JammerHandler.getInstance(viewer);
        for(const jammer of jammers){
            jammerHandler.AddJammer(jammer)
        }
        */
    } catch (err) {
        console.log("data could not be parsed to InitData");
    }
    
}