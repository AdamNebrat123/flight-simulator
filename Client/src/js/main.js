import { createViewer } from './viewerSetup.js';
import { setupPointSelection } from './pointSelection.js';
import { startWebSocketClient } from './websocketClient.js';

let socket = null;
export function getSocket() {
  return socket;
}
// Initialize WebSocket connection
async function initWebSocket() {
    try {
        socket = await startWebSocketClient();
        console.log("WebSocket is ready");
    } catch (err) {
        console.error("Failed to connect to WebSocket server:", err);
    }
}
// Call the init function when the page loads
initWebSocket();





//===============================================================================
//===============================================================================
//===============================================================================
//===============================================================================
// TEST
import { SendMsgToServer } from './serverMsgSender.js';
document.getElementById("sendSampleTrajectory").addEventListener("click", () => {
  const message = {
  type: "PlanesTrajectoryPointsEvent",
  data: {
    planes: [
      {
        planeName: "Plane1",
        geoPoints: [
          {
            longitude: 34.78918523604919,
            latitude: 32.02213504390089,
            altitude: 50
          },
          {
            longitude: 34.774038544220545,
            latitude: 32.02982872817169,
            altitude: 400
          },
          {
            longitude: 34.77867255563069,
            latitude: 32.03800111391642,
            altitude: 50
          },
          {
            longitude: 34.79276682943758,
            latitude: 32.03154574503228,
            altitude: 50
          },
          {
            longitude: 34.78918523604919,
            latitude: 32.02213504390089,
            altitude: 50
          }
        ],
        velocity: 100
      },
      {
        planeName: "Plane2",
        geoPoints: [
          {
            longitude: 34.77684169486766,
            latitude: 32.03444866489948,
            altitude: 60
          },
          {
            longitude: 34.7916519399981,
            latitude: 32.02813029419149,
            altitude: 60
          }
        ],
        velocity: 40
      },
      {
        planeName: "Plane3",
        geoPoints: [
          {
            longitude: 34.79457485673966,
            latitude: 32.03532202508667,
            altitude: 400
          },
          {
            longitude: 34.77205926618796,
            latitude: 32.032993137954726,
            altitude: 50
          }
        ],
        velocity: 100
      }
    ]
  }
};

  const jsonString = JSON.stringify(message);
  SendMsgToServer(jsonString);
});
//===============================================================================
//===============================================================================
//===============================================================================

let viewer;
export function GetViewer() {
    return viewer;
}

window.addEventListener('DOMContentLoaded', async () => {
  // Create viewer in the div with id 'cesiumContainer'
  viewer = await createViewer('cesiumContainer');
  // Setup point selection with the created viewer
  setupPointSelection(viewer);

  
});