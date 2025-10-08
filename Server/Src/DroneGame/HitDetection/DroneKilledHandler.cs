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
        public DroneKilled HandleKill(string killedDroneId, string bulletId)
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
            string msg = WebSocketServer.prepareMessageToClient(S2CMessageType.DroneKilled, killInfo);
            WebSocketServer.SendMsgToClients(msg);

            // Bullet will be removed by BulletsMsgSender after sending the last point

            return killInfo;
        }
	}
}
