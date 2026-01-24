import * as Cesium from "cesium";
import type { RadarUpdate, ScenarioAirCraftsSnapshot, SkyPicture } from "../../Messages/AllTypes";
import type { ZoneEntityManager } from "../../Zones/ZoneEntityManager";
import type { PlaneEntityManager } from "../AirCrafts/PlaneEntityManager";
import type { PlaneTailManager } from "../AirCrafts/PlaneTailManager";
import { ZoneManager } from "../../Zones/ZoneManager";
import { ZoneTypeEnum } from "../../Messages/ZoneTypeEnum";

export class ScenarioPlanesSnapshotHandler {
  private planeEntityManager: PlaneEntityManager;
  private tailManager: PlaneTailManager;
  private dangerZoneEntityManager: ZoneEntityManager;
  private zoneManager: ZoneManager;

  constructor(planeManager: PlaneEntityManager, tailManager: PlaneTailManager, dangerZoneEntityManager: ZoneEntityManager, zoneManager: ZoneManager) {
    this.planeEntityManager = planeManager;
    this.tailManager = tailManager;
    this.dangerZoneEntityManager = dangerZoneEntityManager;
    this.zoneManager = zoneManager;
  }

  // Public entry point for raw data
  public HandleRadarUpdate(data: any) {
    try {
      const radarUpdate = data as RadarUpdate;
      this.processTrajectoryResult(radarUpdate);
    } catch (err) {
      console.log("data could not be parsed to ScenarioPlanesSnapshot");
    }
  }

  private async processTrajectoryResult(
    radarUpdate: RadarUpdate
  ): Promise<void> {
    const uniqueDangerZones = new Set<string>();
    const skyPicture: SkyPicture = radarUpdate.skyPicture;

    for (const aircraft of skyPicture.aircrafts) {
      for (const point of aircraft.trajectoryPoints) {
        const position = Cesium.Cartesian3.fromDegrees(
          point.position.longitude,
          point.position.latitude,
          point.position.altitude
        );
        // Update the plane itself
        this.planeEntityManager.updateOrCreateEntity(
          aircraft,
          aircraft.aircraftName,
          position,
          point.heading,
          point.pitch
        );

        /*
        // Check if plane is in danger zone - to make the plane blink
        if (aircraft.isInDangerZone) {
          this.planeEntityManager.startBlinking(aircraft.aircraftName);
        } else {
          this.planeEntityManager.stopBlinking(aircraft.aircraftName);
        }

        */
       
        // Add every danger zone name to the set
        for (const zoneId of aircraft.dangerZonesIn) {
            if((this.zoneManager.getZone(zoneId))?.zoneType === ZoneTypeEnum.Danger)
                uniqueDangerZones.add(zoneId);
        }

        // Update the tail
        this.tailManager.updateTail(aircraft.aircraftName, aircraft.tailPoints);
      }
    }
  }
}
