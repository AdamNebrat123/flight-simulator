import * as Cesium from "cesium";
import type { MultiPlaneTrajectoryResult } from "../Messages/AllTypes";
import { PlaneEntityManager } from "./PlaneEntityManager";
import { PlaneTailManager } from "./PlaneTailManager";
import type { DangerZoneEntityManager } from "../DangerZonePanel/DangerZoneEntityManager";

export class MultiPlaneTrajectoryResultHandler {
  private planeManager: PlaneEntityManager;
  private tailManager: PlaneTailManager;
  private dangerZoneEntityManager: DangerZoneEntityManager;

  constructor(planeManager: PlaneEntityManager, tailManager: PlaneTailManager, dangerZoneEntityManager: DangerZoneEntityManager) {
    this.planeManager = planeManager;
    this.tailManager = tailManager;
    this.dangerZoneEntityManager = dangerZoneEntityManager;
  }

  // Public entry point for raw data
  public HandleMultiPlaneTrajectoryResult(data: any) {
    try {
      const multiPlaneTrajectoryResult = data as MultiPlaneTrajectoryResult;
      console.log("ALL PLANE POINTS:", multiPlaneTrajectoryResult);

      this.processTrajectoryResult(multiPlaneTrajectoryResult);
    } catch (err) {
      console.log("data could not be parsed to MultiPlaneTrajectoryResult");
    }
  }

  private async processTrajectoryResult(
    multiPlaneTrajectoryResult: MultiPlaneTrajectoryResult
  ): Promise<void> {
    const uniqueDangerZones = new Set<string>();
    
    for (const plane of multiPlaneTrajectoryResult.planes) {
      for (const point of plane.trajectoryPoints) {
        const position = Cesium.Cartesian3.fromDegrees(
          point.position.longitude,
          point.position.latitude,
          point.position.altitude
        );

        // Update the plane itself
        this.planeManager.updateOrCreateEntity(
          plane.planeName,
          position,
          point.heading,
          point.pitch
        );

        // Check if plane is in danger zone - to make the plane blink
        if (plane.isInDangerZone) {
          this.planeManager.startBlinking(plane.planeName);
        } else {
          this.planeManager.stopBlinking(plane.planeName);
        }

        // Add every danger zone name to the set
        for (const dz of plane.dangerZonesIn) {
            uniqueDangerZones.add(dz);
        }

        // Update the tail
        this.tailManager.updateTail(plane.planeName, plane.tailPoints);
      }
    }
    // After processing all planes, check all danger zones to know what danger zone(s) should blink
    const allDangerZoneNames = this.dangerZoneEntityManager.getAllDangerZoneNames();
    for (const zoneName of allDangerZoneNames) {
        if (uniqueDangerZones.has(zoneName)) {
            this.dangerZoneEntityManager.startBlinking(zoneName);
        } else {
            this.dangerZoneEntityManager.stopBlinking(zoneName);
        }
    }
  }
}
