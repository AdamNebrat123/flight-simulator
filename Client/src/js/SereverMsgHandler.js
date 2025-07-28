import { CalculatedTrajectoryPoints } from "./msgTypes/CalculatedTrajectoryPoints.js";
import { MessageWrapper } from "./MessageWrapper.js";
import { GetViewer } from "./main.js";
import { msgTypes } from "./msgTypes/allMsgTypes.js";

export async function HandleIncomingMsg(event) {
    console.log("Message from server:", event.data);

    try {
        const raw = JSON.parse(event.data);
        const message = new MessageWrapper(raw.type, raw.data);

        switch (message.type) {
            case msgTypes.CalculatedTrajectoryPoints:
                const calculatedTrajectoryPoints = new CalculatedTrajectoryPoints(message.data);
                console.log("Received trajectory points:", calculatedTrajectoryPoints);
                // Handle the calculated trajectory points
                HandleCalculatedTrajectoryPoints(calculatedTrajectoryPoints)
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

    const pointEntities = []; // Array to store the created point entities

    calculatedTrajectoryPoints.trajectoryPoints.forEach((point, index) => {
        const entity = viewer.entities.add({
            name: `Trajectory Point ${index + 1}`,
            position: Cesium.Cartesian3.fromDegrees(point.position.longitude, point.position.latitude, point.position.height),
            point: {
                pixelSize: 8,
                color: Cesium.Color.RED,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 1,
            }
        });

        pointEntities.push(entity); // Store the reference
    });

    // You can now return this array or store it somewhere
    return pointEntities;
}

async function RemoveEntities(entities) {
    entities.forEach(e => GetViewer().entities.remove(e));
}