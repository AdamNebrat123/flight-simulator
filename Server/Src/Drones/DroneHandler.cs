using System.Net.WebSockets;
using System.Text.Json;

public class DroneHandler
{
    private static DroneHandler instance;
    private readonly DroneManager droneManager = DroneManager.GetInstance();

    private DroneHandler() { }

    public static DroneHandler GetInstance()
    {
        if (instance == null)
            instance = new DroneHandler();
        return instance;
    }
    

    public void HandleRequestDronesInitData(WebSocket connection, JsonElement data)
    {
        try
        {
            // צור UUID חדש
            Guid uuid = Guid.NewGuid();
            string uuidString = uuid.ToString();

            // צור רחפן חדש עם ID ודיפולט
            var defaultPosition = new GeoPoint(34.78217676812864, 32.02684069644974, 160);
            var defaultTrajectory = new TrajectoryPoint(defaultPosition, 0, 0);
            var drone = new Drone(uuidString, defaultTrajectory);

            // הוסף ל־DroneManager
            droneManager.TryAddDrone(drone);

            // שלח חזרה ללקוח DRONEINITDATA רק עם ה-ID
            var initData = new
            {
                yourDroneId = uuidString
            };
            string json = WebSocketServer.prepareMessageToClient(S2CMessageType.DroneInitData, initData);
            WebSocketServer.SendMsgToClient(connection, json);
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error in HandleRequestDronesInitData: " + ex.Message);
        }
    }


    public void HandleAddDrone(JsonElement data)
    {
        try
        {
            Drone drone = data.Deserialize<Drone>();
            if (drone == null)
                throw new Exception("Deserialization returned null");

            Guid uuid = Guid.NewGuid();
            string uuidString = uuid.ToString();
            drone.id = uuidString;

            bool added = droneManager.TryAddDrone(drone);
            if (added)
            {
                Console.WriteLine($"{drone.id} - Drone added successfully.");
            }
            else
            {
                Console.WriteLine($"{drone.id} - Failed to add drone.");
                SendDroneError($"{drone.id} - Failed to add drone.");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error in HandleAddDrone: " + ex.Message);
        }
    }

    public void HandleRemoveDrone(JsonElement data)
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
                SendRemoveDrone(drone);
            }
            else
            {
                Console.WriteLine($"{drone.id} - Failed to remove drone.");
                SendDroneError($"{drone.id} - Failed to remove drone.");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error in HandleRemoveDrone: " + ex.Message);
        }
    }

    public void HandleUpdateDrone(JsonElement data)
    {
        try
        {
            Drone drone = data.Deserialize<Drone>();
            if (drone == null)
                throw new Exception("Deserialization returned null");

            bool updated = droneManager.TryUpdateDrone(drone.id, drone);
            if (updated)
            {
                Console.WriteLine($"{drone.id} - Drone updated successfully.");
                SendUpdateDrone(drone);
            }
            else
            {
                Console.WriteLine($"{drone.id} - Failed to update drone.");
                SendDroneError($"{drone.id} - Failed to update drone.");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error in HandleUpdateDrone: " + ex.Message);
        }
    }

    public void SendRemoveDrone(Drone drone)
    {
        string data = WebSocketServer.prepareMessageToClient(S2CMessageType.RemoveDrone, drone);
        WebSocketServer.SendMsgToClients(data);
    }

    public void SendUpdateDrone(Drone drone)
    {
        string data = WebSocketServer.prepareMessageToClient(S2CMessageType.UpdateDrone, drone);
        WebSocketServer.SendMsgToClients(data);
    }

    public void SendDroneError(string errorMsg)
    {
        var err = new { errorMsg };
        string data = WebSocketServer.prepareMessageToClient(S2CMessageType.DroneError, err);
        WebSocketServer.SendMsgToClients(data);
    }
}