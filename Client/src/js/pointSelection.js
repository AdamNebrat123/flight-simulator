import {checkLineOfSight} from './los.js'

// Export a function that sets up point selection handlers on a given viewer
export async function setupPointSelection(viewer) {
  let losMode = false;
  let points = [];
  // Get reference to the button
  const startButton = document.getElementById("startLosTool");

  // Add click listener to toggle LOS mode and reset points
  startButton.addEventListener("click", () => {
    losMode = true;
    points = [];
    console.log("LOS mode enabled, click on the map to select points.");
  });

  // Create a ScreenSpaceEventHandler for mouse clicks on the viewer canvas
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

  handler.setInputAction(async (click) => {
    if (!losMode) return;

    const cartesian = viewer.scene.pickPosition(click.position); // pickPosition works only if depthTestAgainstTerrain is enabled in viewer
    if (!cartesian) {
      alert("Click was not on the globe or a 3D object.");
      return;
    }
    // Convert to geographic coordinates
     const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    const lon = Cesium.Math.toDegrees(cartographic.longitude);
    const lat = Cesium.Math.toDegrees(cartographic.latitude);
    const baseHeight = cartographic.height;

    // Ask user for additional height input
    const addedHeightStr = prompt(`Base height is ${baseHeight.toFixed(2)} meters.\nEnter additional height in meters:`);
    const addedHeight = Number(addedHeightStr);
    if (isNaN(addedHeight)) {
      alert("Invalid height entered.");
      return;
    }

    // Save the point with adjusted height
    const newPoint = {
      longitude: lon,
      latitude: lat,
      height: baseHeight + addedHeight
    };
    points.push(newPoint);


    // Add a visual marker for the selected point
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(newPoint.longitude, newPoint.latitude, newPoint.height),
      point: {
        pixelSize: 10,
        color: Cesium.Color.RED,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
      }
    });
    
    console.log("Point added:", points[points.length - 1]);

    if (points.length === 2) {
      losMode = false;
      console.log("2 points selected, LOS mode disabled.");

      // calculate the los and draw a line that reresents it.
      checkLineOfSight(points, viewer)
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}