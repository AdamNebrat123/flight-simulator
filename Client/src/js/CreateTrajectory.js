import { SendMsgToServer } from "./serverMsgSender.js";
import { prepareMessageToServer } from "./ConvertToJson.js";
import { msgTypes } from "./msgTypes/allMsgTypes.js";
import { GeoPoint } from "./msgTypes/GeoPoint.js";
//import { TrajectoryPointsEvent } from "./msgTypes/TrajectoryPointsEvent.js";

// Export a function that sets up point selection handlers on a given viewer
export async function setUpCreateJrajecory(viewer) {
  let createTrajectoryMode = false;
  let trajectoryPoints = [];
  // Get reference to the button
  const startButton = document.getElementById("selectTrajectory");

  // Add click listener to toggle createTrajectoryMode and reset points
  startButton.addEventListener("click", () => {
    createTrajectoryMode = true;
    trajectoryPoints = [];
    console.log("createTrajectoryMode mode enabled, click on the map to select points.");
  });

  // Create a ScreenSpaceEventHandler for mouse clicks on the viewer canvas
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

  handler.setInputAction(async (click) => {
    if (!createTrajectoryMode) return;

    const cartesian = viewer.scene.pickPosition(click.position); // pickPosition works only if depthTestAgainstTerrain is enabled in viewer
    if (!cartesian) {
      alert("Click was not on the globe or a 3D object.");
      return;
    }
    // Convert to geographic coordinates
     const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    const lon = Cesium.Math.toDegrees(cartographic.longitude);
    const lat = Cesium.Math.toDegrees(cartographic.latitude);
    const baseHeight = 80; // 80 just for now, as the deafult height
    //const baseHeight = cartographic.height;

    // Save the point with adjusted height
    const newGeoPoint = new GeoPoint(lon, lat, baseHeight);
    trajectoryPoints.push(newGeoPoint);


    // Add a visual marker for the selected point
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(newGeoPoint.longitude, newGeoPoint.latitude, newGeoPoint.height),
      point: {
        pixelSize: 10,
        color: Cesium.Color.RED,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
      }
    });
    
    console.log("Point added:", trajectoryPoints[trajectoryPoints.length - 1]);

    if (trajectoryPoints.length === 2) {
      createTrajectoryMode = false;
      console.log("2 points selected, createTrajectoryMode mode disabled.");
      // select velocity
      const velocity = await showVelocityModal();
      if (velocity === null) {
        console.log("User canceled.");
        return;
      }
      
      //const trajectoryPointsEvent = new TrajectoryPointsEvent(trajectoryPoints, velocity);
      // Convert points to json
      //const msgJson = prepareMessageToServer(msgTypes.TrajectoryPoints, trajectoryPointsEvent);
      //await SendMsgToServer(msgJson);
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

async function showVelocityModal() {
  return new Promise((resolve) => {
    const modal = document.getElementById("velocityModal");
    const submitBtn = document.getElementById("velocitySubmit");
    const cancelBtn = document.getElementById("velocityCancel");
    const input = document.getElementById("velocityInput");

    modal.style.display = "block";

    const cleanup = () => {
      submitBtn.onclick = null;
      cancelBtn.onclick = null;
      modal.style.display = "none";
      input.value = "";
    };

    submitBtn.onclick = () => {
      const velocity = Number(input.value);
      if (isNaN(velocity) || velocity <= 0) {
        alert("Please enter a valid positive number.");
        return;
      }

      cleanup();
      resolve(velocity);
    };

    cancelBtn.onclick = () => {
      cleanup();
      resolve(null); // canceled
    };
  });
}