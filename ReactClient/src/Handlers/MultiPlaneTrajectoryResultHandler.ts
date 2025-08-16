import * as Cesium from 'cesium';
import type { MultiPlaneTrajectoryResult } from '../Messages/AllTypes';
import { PlaneEntityManager } from './PlaneEntityManager';
import { PlaneTailManager } from './PlaneTailManager';
export function MultiPlaneTrajectoryResultHandler(data: any, planeManager: PlaneEntityManager,tailManager: PlaneTailManager){

    try{
    const multiPlaneTrajectoryResult = data as MultiPlaneTrajectoryResult;
    console.log("ALL PLANE POINTS:" ,multiPlaneTrajectoryResult);

    HandleMultiPlaneTrajectoryResult(multiPlaneTrajectoryResult, planeManager, tailManager)
    }
    catch(err){
        console.log("data could not be parsed to MultiPlaneTrajectoryResult")
    }
}

async function HandleMultiPlaneTrajectoryResult(
    multiPlaneTrajectoryResult: MultiPlaneTrajectoryResult,
    planeManager: PlaneEntityManager,
    tailManager: PlaneTailManager
): Promise<void> {
    for (const plane of multiPlaneTrajectoryResult.planes) {
        for (const point of plane.trajectoryPoints) {
            const position = Cesium.Cartesian3.fromDegrees(
                point.position.longitude,
                point.position.latitude,
                point.position.altitude
            );

            // Update the plane itself
            planeManager.updateOrCreateEntity(
                plane.planeName,
                position,
                point.heading,
                point.pitch
            );

            // Update the tail
            tailManager.updateTail(plane.planeName, plane.tailPoints);
        }
    }
}
