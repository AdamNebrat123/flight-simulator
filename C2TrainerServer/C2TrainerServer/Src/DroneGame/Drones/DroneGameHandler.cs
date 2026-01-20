using System.Net.WebSockets;
using System.Text.Json;
using System.Collections.Concurrent;
using DroneGame.Arena;
using DroneGame.HitDetection;

public class DroneGameHandler
{
    private static DroneGameHandler instance;
    private readonly DroneManager droneManager = DroneManager.GetInstance();
    private readonly HitDetector hitDetector = HitDetector.GetInstance();
    private readonly DroneKilledHandler droneKilledHandler = DroneKilledHandler.GetInstance();
    private readonly ArenaBoundaryChecker arenaBoundaryChecker = ArenaBoundaryChecker.GetInstance();
    private readonly ConcurrentDictionary<string, bool> doNotUpdateDrones = new();
    private const int KILL_TIMEOUT_MS = 5000; // 5 seconds, adjust as needed

    private DroneGameHandler() { }

    private void AddToDoNotUpdateDrones(string droneId)
    {
        // Add to recently Do Not Update Drones
        doNotUpdateDrones.TryAdd(droneId, true);

        // Start a task to remove it after timeout
        Task.Delay(KILL_TIMEOUT_MS).ContinueWith(_ =>
        {
            doNotUpdateDrones.TryRemove(droneId, out bool _);
        });
    }

    public static DroneGameHandler GetInstance()
    {
        if (instance == null)
            instance = new DroneGameHandler();
        return instance;
    }
    

    public void HandleRequestDronesInitData(WebSocket connection, JsonElement data, ModeEnum clientMode)
    {
        try
        {
            // create new UUID
            Guid uuid = Guid.NewGuid();
            string uuidString = uuid.ToString();

            // create new drone with ID and default
            var defaultPosition = new GeoPoint(34.78217676812864, 32.02684069644974, 160);
            var defaultTrajectory = new TrajectoryPoint(defaultPosition, 0, 0);
            var drone = new Drone(uuidString, defaultTrajectory);

            // Add to DroneManager
            droneManager.TryAddDrone(drone);

            // Send back to client DRONEINITDATA only with the ID
            var initData = new
            {
                yourDroneId = uuidString
            };
            string json = UIWebSocketServer.PrepareMessageToClient(S2CMessageType.DroneInitData, initData, clientMode);
            UIWebSocketServer.SendMsgToClient(connection, json);
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error in HandleRequestDronesInitData: " + ex.Message);
        }
    }

    public void HandleRemoveDrone(JsonElement data, ModeEnum clientMode)
    {
        try
        {
            Drone drone = data.Deserialize<Drone>();
            if (drone == null)
                throw new Exception("Deserialization returned null");

            bool removed = droneManager.TryRemoveDrone(drone.id);
            if (removed)
            {
                Console.WriteLine($"{drone.id} - Drone removed successfully.");

                // Add To Do Not Update Drones
                // Because i dont want to accidentaly get an update exactly after leaving.
                AddToDoNotUpdateDrones(drone.id);

                SendRemoveDrone(drone, clientMode);
            }
            else
            {
                Console.WriteLine($"{drone.id} - Failed to remove drone.");
                SendDroneError($"{drone.id} - Failed to remove drone.", clientMode);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error in HandleRemoveDrone: " + ex.Message);
        }
    }

    public void HandleUpdateDrone(JsonElement data, ModeEnum clientMode)
    {
        try
        {
            Drone drone = data.Deserialize<Drone>();
            if (drone == null)
                throw new Exception("Deserialization returned null");

            // If drone is in recently killed list, ignore the update
            if (doNotUpdateDrones.ContainsKey(drone.id))
            {
                return;
            }

            // Check if inside arena boundaries. if not, kill the drone, and return.
            if (!arenaBoundaryChecker.IsPointInsideArena(drone.trajectoryPoint.position))
            {
                Console.WriteLine($"{drone.id} - Drone killed for leaving arena boundaries.");
                this.droneKilledHandler.HandleArenaKill(drone.id);
                AddToDoNotUpdateDrones(drone.id);
                return;
            }

            // Check for bullet hit
            string? bulletId = this.hitDetector.CheckHit(drone); // returns bulletId if hit, null otherwise
            if (bulletId != null)
            {
                // Handle kill
                this.droneKilledHandler.HandleKill(drone.id, bulletId, clientMode);
                AddToDoNotUpdateDrones(drone.id);
                // Do not update or send update for killed drone
                return;
            }

            // If drone does not exist, add it first
            if (!droneManager.ContainsDrone(drone.id))
            {
                droneManager.TryAddDrone(drone);
            }

            bool updated = droneManager.TryUpdateDrone(drone.id, drone);
            if (updated)
            {
                //Console.WriteLine($"{drone.id} - Drone updated successfully.");
                SendUpdateDrone(drone, clientMode);
            }
            else
            {
                Console.WriteLine($"{drone.id} - Failed to update drone.");
                SendDroneError($"{drone.id} - Failed to update drone.", clientMode);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error in HandleUpdateDrone: " + ex.Message);
        }
    }

    public void SendRemoveDrone(Drone drone, ModeEnum clientMode)
    {
        string data = UIWebSocketServer.PrepareMessageToClient(S2CMessageType.RemoveDrone, drone, clientMode);
        UIWebSocketServer.SendMsgToClients(data, clientMode);
    }

    public void SendUpdateDrone(Drone drone, ModeEnum clientMode)
    {
        string data = UIWebSocketServer.PrepareMessageToClient(S2CMessageType.UpdateDrone, drone, clientMode);
        UIWebSocketServer.SendMsgToClients(data, clientMode);
    }

    public void SendDroneError(string errorMsg, ModeEnum clientMode)
    {
        var err = new { errorMsg };
        string data = UIWebSocketServer.PrepareMessageToClient(S2CMessageType.DroneError, err, clientMode);
        UIWebSocketServer.SendMsgToClients(data, clientMode);
    }
}