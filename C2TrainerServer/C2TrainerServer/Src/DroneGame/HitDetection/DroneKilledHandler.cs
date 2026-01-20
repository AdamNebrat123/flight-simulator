using System;
using System.Collections.Generic;
using DroneGame;
using System.Net.WebSockets;

namespace DroneGame.HitDetection
{
    public class DroneKilledHandler
    {
        private static DroneKilledHandler instance = new DroneKilledHandler();
        private BulletStore bulletStore = BulletStore.GetInstance();
        private DroneManager droneManager = DroneManager.GetInstance();

        private DroneKilledHandler() { }

        public static DroneKilledHandler GetInstance()
        {
            return instance;
        }

        // Handles the kill event: sets bullet isLast, disconnects bullet, removes drone, sends kill message
        public DroneKilled HandleKill(string killedDroneId, string bulletId, ModeEnum clientMode)
        {
            var bulletPoints = bulletStore.GetBulletPoints(bulletId);
            if (bulletPoints == null || bulletPoints.Count == 0)
            {
                throw new Exception("Bullet not found or empty");
            }

            var firstNode = bulletPoints.First;
            if (firstNode == null)
            {
                throw new Exception("No bullet point found");
            }

            // Set isLast = true for the next point
            firstNode.Value.isLast = true;

            // Create a new linked list with only this point
            var newBulletPoints = new LinkedList<BulletData>();
            newBulletPoints.AddLast(firstNode.Value);

            // Update the bullet in the store to only contain this node
            bulletStore.UpdateBullet(bulletId, new List<BulletData> { firstNode.Value });

            // Get killer drone id from bullet data
            string killerDroneId = firstNode.Value.droneId ?? "unknown";

            // Remove killed drone
            bool removed = droneManager.TryRemoveDrone(killedDroneId);

            // Prepare kill info
            var killInfo = new DroneKilled(killerDroneId, killedDroneId, bulletId);
            System.Console.WriteLine($"[DroneKilledHandler] Drone killed: killer={killerDroneId}, killed={killedDroneId}, bullet={bulletId}");

            // Send DroneKilled message to all clients
            SendDroneKilledMessage(killInfo, clientMode);

            // Bullet will be removed by BulletsMsgSender after sending the last point

            return killInfo;
        }

        private void SendDroneKilledMessage(DroneKilled killInfo, ModeEnum clientMode)
        {
            string msg = UIWebSocketServer.PrepareMessageToClient(S2CMessageType.DroneKilled, killInfo, clientMode);
            UIWebSocketServer.SendMsgToClients(msg, clientMode);
        }

        public void HandleArenaKill(string droneId)
        {
            // For arena kills, we don't have a bulletId or killerDroneId
            var killInfo = new DroneKilled("Arena", droneId, "N/A");
            System.Console.WriteLine($"[DroneKilledHandler] Drone killed for leaving arena: killed={droneId}");

            // Remove killed drone
            bool removed = droneManager.TryRemoveDrone(droneId);

            // Send DroneKilled message to all clients
            SendDroneKilledMessage(killInfo, ModeEnum.DroneGame);
        }
	}
}
