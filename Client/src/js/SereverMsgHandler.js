import { CalculatedTrajectoryPoints } from "./msgTypes/CalculatedTrajectoryPoints.js";
import { MessageWrapper } from "./MessageWrapper.js";
import { GetViewer } from "./main.js";
import { msgTypes } from "./msgTypes/allMsgTypes.js";

// NEEDED FOR msgTypes.CalculatedTrajectoryPoints
let currentPlaneEntities = [];

export async function HandleIncomingMsg(event) {
    console.log("Message from server:", event.data);

    try {
        const raw = JSON.parse(event.data);
        const message = new MessageWrapper(raw.type, raw.data);

        


        switch (message.type) {
            case msgTypes.CalculatedTrajectoryPoints:
                const calculatedTrajectoryPoints = new CalculatedTrajectoryPoints(message.data);
                console.log("Received trajectory points:", calculatedTrajectoryPoints);

                // Remove old entities first
                RemoveEntities(currentPlaneEntities);

                // Handle and store new entities
                currentPlaneEntities = await HandleCalculatedTrajectoryPoints(calculatedTrajectoryPoints);
                break;

            default:
                console.warn("Unknown message type:", message.type);
        }

    } catch (err) {
        console.error("Failed to parse or handle message:", err);
    }
}


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
                scale: 2.5,
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

async function RemoveEntities(entities) {
    entities.forEach(e => GetViewer().entities.remove(e));
}