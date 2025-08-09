import * as Cesium from 'cesium';
import type { MultiPlaneTrajectoryResult } from '../Messages/AllTypes';
import { PlaneEntityManager } from './PlaneEntityManager';
export function MultiPlaneTrajectoryResultHandler(data: any, planeManager: PlaneEntityManager){

    try{
    const multiPlaneTrajectoryResult = data as MultiPlaneTrajectoryResult;
    console.log("ALL PLANE POINTS:" ,multiPlaneTrajectoryResult);

    HandleMultiPlaneTrajectoryResult(multiPlaneTrajectoryResult, planeManager)
    }
    catch(err){
        console.log("data could not be parsed to MultiPlaneTrajectoryResult")
    }
}

async function HandleMultiPlaneTrajectoryResult(
  multiPlaneTrajectoryResult: MultiPlaneTrajectoryResult,
  planeManager: PlaneEntityManager
): Promise<void> {
  for (const plane of multiPlaneTrajectoryResult.planes) {
    for (const point of plane.trajectoryPoints) {
      console.log("Handling trajectory for plane:", plane.planeName);

      const position = Cesium.Cartesian3.fromDegrees(
        point.position.longitude,
        point.position.latitude,
        point.position.altitude
      );

      // Here we only transfer the geographic values
      planeManager.updateOrCreateEntity(
        plane.planeName,
        position,
        point.heading,
        point.pitch
      );
    }
  }
}


