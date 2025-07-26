import { createViewer } from './viewerSetup.js';
import { setupPointSelection } from './pointSelection.js';
import { startWebSocketClient } from './websocketClient.js';


let socket = null;

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

// Handle the "Send HELLO" button click
document.getElementById('sendHelloBtn').addEventListener('click', () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send("HELLO");
        console.log("Sent: HELLO");
    } else {
        console.warn("WebSocket is not open");
    }
});

window.addEventListener('DOMContentLoaded', async () => {
  // Create viewer in the div with id 'cesiumContainer'
  const viewer = await createViewer('cesiumContainer');

  // Setup point selection with the created viewer
  setupPointSelection(viewer);
  
});