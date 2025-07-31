import { MultiPlaneTrajectoryResult } from "./Messages/ReceiveMsgTypes/MultiPlaneTrajectoryResult.js";
import { MessageWrapper } from "./Messages/MessageWrapper.js";
import { GetViewer } from "./main.js";
import { msgTypes } from "./Messages/allMsgTypes.js";
import { PlaneEntityManager } from "./trajectoryScenario/PlaneEntityManager.js";

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
