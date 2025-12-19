import * as Cesium from "cesium";
import type { ScenarioAirCraftsSnapshot } from "../../Messages/AllTypes";
import type { ZoneEntityManager } from "../../ZonesPanel/ZoneEntityManager";
import type { PlaneEntityManager } from "../AirCrafts/PlaneEntityManager";
import type { PlaneTailManager } from "../AirCrafts/PlaneTailManager";

export class ScenarioPlanesSnapshotHandler {
  private planeEntityManager: PlaneEntityManager;
  private tailManager: PlaneTailManager;
  private dangerZoneEntityManager: ZoneEntityManager;

  constructor(planeManager: PlaneEntityManager, tailManager: PlaneTailManager, dangerZoneEntityManager: ZoneEntityManager) {
    this.planeEntityManager = planeManager;
    this.tailManager = tailManager;
    this.dangerZoneEntityManager = dangerZoneEntityManager;
  }

  // Public entry point for raw data
  public HandleScenarioPlanesSnapshot(data: any) {
    try {
      const scenarioPlanesSnapshot = data as ScenarioAirCraftsSnapshot;
      console.log("ALL PLANE POINTS:", scenarioPlanesSnapshot);

      this.processTrajectoryResult(scenarioPlanesSnapshot);
    } catch (err) {
      console.log("data could not be parsed to ScenarioPlanesSnapshot");
    }
  }

  private async processTrajectoryResult(
    scenarioPlanesSnapshot: ScenarioAirCraftsSnapshot
  ): Promise<void> {
    const uniqueDangerZones = new Set<string>();

    for (const aircraft of scenarioPlanesSnapshot.aircrafts) {
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

        // Check if plane is in danger zone - to make the plane blink
        if (aircraft.isInDangerZone) {
          this.planeEntityManager.startBlinking(aircraft.aircraftName);
        } else {
          this.planeEntityManager.stopBlinking(aircraft.aircraftName);
        }

        // Add every danger zone name to the set
        for (const dz of aircraft.dangerZonesIn) {
            uniqueDangerZones.add(dz);
        }

        // Update the tail
        this.tailManager.updateTail(aircraft.aircraftName, aircraft.tailPoints);
      }
    }
    // After processing all planes, check all danger zones to know what danger zone(s) should blink
    const allDangerIds = this.dangerZoneEntityManager.getAllZoneIds();
    console.log(allDangerIds)
    for (const zoneId of allDangerIds) {
        if (uniqueDangerZones.has(zoneId)) {
            this.dangerZoneEntityManager.startBlinking(zoneId);
        } else {
            this.dangerZoneEntityManager.stopBlinking(zoneId);
        }
    }
  }
}
