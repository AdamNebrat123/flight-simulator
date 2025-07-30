import { MultiPlaneTrajectoryResult } from "./msgTypes/MultiPlaneTrajectoryResult.js";
import { MessageWrapper } from "./MessageWrapper.js";
import { GetViewer } from "./main.js";
import { msgTypes } from "./msgTypes/allMsgTypes.js";
import { PlaneEntityManager } from "./PlaneEntityManager.js";

const planeManager = new PlaneEntityManager();

export async function HandleIncomingMsg(event) {
    console.log("Message from server:", event.data);

    try {
        const raw = JSON.parse(event.data);
        const message = new MessageWrapper(raw.type, raw.data);

        


        switch (message.type) {
            case msgTypes.MultiPlaneTrajectoryResult:
                const multiPlaneTrajectoryResult = new MultiPlaneTrajectoryResult(message.data);
                console.log("ALL PLANE POINTS:" ,multiPlaneTrajectoryResult.toString())
                if(!planeManager.viewer)
                    planeManager.setViewer(GetViewer());
                // Handle
                HandleMultiPlaneTrajectoryResult(multiPlaneTrajectoryResult, planeManager);
                break;

            default:
                console.warn("Unknown message type:", message.type);
        }

    } catch (err) {
        console.error("Failed to parse or handle message:", err);
    }
}
async function HandleMultiPlaneTrajectoryResult(multiPlaneTrajectoryResult, planeManager) {
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
/*
async function HandleCalculatedTrajectoryPoints(calculatedTrajectoryPoints) {
    const viewer = GetViewer();

    const Entities = []; // Array to store the created point entities

    calculatedTrajectoryPoints.trajectoryPoints.forEach((point, index) => {
        const position = Cesium.Cartesian3.fromDegrees(
            point.position.longitude,
            point.position.latitude,
            point.position.height);
        const heading = Cesium.Math.toRadians(point.heading);
        const pitch = Cesium.Math.toRadians(point.pitch);
        const roll = 0.0;
        //Create HeadingPitchRoll Object
        const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
        //Calculate Orientation Quaternion
        const orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);

        //Add the Plane Entity
        //position: Where the plane is placed (converted 3D Cartesian point).
        //orientation: How the plane is rotated at that position, based on heading and pitch.
        const entity = viewer.entities.add({
            position: position,
            orientation: orientation,
            model: {
                uri: "https://raw.githubusercontent.com/CesiumGS/cesium/master/Apps/SampleData/models/CesiumAir/Cesium_Air.glb",
                scale: 1.5,
                minimumPixelSize: 64,
                color: Cesium.Color.WHITE,
                // disable lighting for flat bright look
                lightColor: new Cesium.Color(1.0, 1.0, 1.0, 1.0), 
                silhouetteColor: Cesium.Color.YELLOW,  // add outline (see next point)
                silhouetteSize: 2.0
            }
        });
        Entities.push(entity); // Store the reference
    });

    // You can now return this array or store it somewhere
    return Entities;
}
    */

async function RemoveEntities(entities) {
    entities.forEach(e => GetViewer().entities.remove(e));
}