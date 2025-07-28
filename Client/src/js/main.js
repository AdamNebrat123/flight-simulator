import { createViewer } from './viewerSetup.js';
import { setupPointSelection } from './pointSelection.js';
import { startWebSocketClient } from './websocketClient.js';
import { setUpCreateJrajecory } from './CreateTrajectory.js';

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

let viewer;
export function GetViewer() {
    return viewer;
}
window.addEventListener('DOMContentLoaded', async () => {
  // Create viewer in the div with id 'cesiumContainer'
  viewer = await createViewer('cesiumContainer');
  // Setup point selection with the created viewer
  setupPointSelection(viewer);
  setUpCreateJrajecory(viewer);

  
});