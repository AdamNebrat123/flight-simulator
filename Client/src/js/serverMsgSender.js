import { getSocket } from "./main.js";

export async function SendMsgToServer(msg){
    const socket = getSocket();
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(msg);
        console.log("Sent: ", msg);
    } else {
        alert("WebSocket is not open");
        console.warn("WebSocket is not open");
    }
}