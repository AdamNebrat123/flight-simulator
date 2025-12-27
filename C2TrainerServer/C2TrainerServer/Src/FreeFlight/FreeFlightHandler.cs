using System.Net.WebSockets;
using System.Text.Json;
using System.Collections.Concurrent;
using DroneGame.Arena;
using DroneGame.HitDetection;

public class FreeFlightHandler
{
    private static FreeFlightHandler instance;
    private readonly DroneManager droneManager = DroneManager.GetInstance();

    private FreeFlightHandler() { }


    public static FreeFlightHandler GetInstance()
    {
        if (instance == null)
            instance = new FreeFlightHandler();
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
            string json = WebSocketServer.prepareMessageToClient(S2CMessageType.DroneInitData, initData, clientMode);
            WebSocketServer.SendMsgToClient(connection, json);
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
        string data = WebSocketServer.prepareMessageToClient(S2CMessageType.RemoveDrone, drone, clientMode);
        WebSocketServer.SendMsgToClients(data, clientMode);
    }

    public void SendUpdateDrone(Drone drone, ModeEnum clientMode)
    {
        string data = WebSocketServer.prepareMessageToClient(S2CMessageType.UpdateDrone, drone, clientMode);
        WebSocketServer.SendMsgToClients(data, clientMode);
    }

    public void SendDroneError(string errorMsg, ModeEnum clientMode)
    {
        var err = new { errorMsg };
        string data = WebSocketServer.prepareMessageToClient(S2CMessageType.DroneError, err, clientMode);
        WebSocketServer.SendMsgToClients(data, clientMode);
    }
}