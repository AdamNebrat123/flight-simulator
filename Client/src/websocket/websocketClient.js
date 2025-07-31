import { HandleIncomingMsg } from "../ServerMsgHandler.js";
export async function startWebSocketClient(serverUrl = "ws://localhost:5000") {
    return new Promise((resolve, reject) => {
        const socket = new WebSocket(serverUrl);

        socket.onopen = () => {
            console.log("Connected to WebSocket server");
            resolve(socket); // Returns the connection object 
        };

        socket.onmessage = HandleIncomingMsg;

        socket.onerror = (err) => {
            console.error("WebSocket error:", err);
            reject(err);
        };

        socket.onclose = () => {
            console.log("Connection closed");
        };
    });
}