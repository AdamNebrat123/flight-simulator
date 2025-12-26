using System.Text.Json;

public class ZoneHandler
{
    private static ZoneHandler instance;
    private readonly ZoneManager zoneManager = ZoneManager.GetInstance();
    private readonly ZonesDataManager zonesDataManager = ZonesDataManager.GetInstance();
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };
    
    private ZoneHandler()
    {
    }
    public static ZoneHandler GetInstance()
    {
        if (instance == null)
        {
            instance = new ZoneHandler();
        }
        return instance;
    }

    public void HandleAddZone(JsonElement data, ModeEnum clientMode)
    {
        try
        {
            Zone zone = JsonSerializer.Deserialize<Zone>(data);

            Guid uuid = Guid.NewGuid();
            string uuidString = uuid.ToString();
            zone.zoneId = uuidString;


            // add in file
            zonesDataManager.AddAndSaveZone(zone);

            // add in a map 
            bool isAdded = zoneManager.TryAddZone(zone);
            if (isAdded)
            {
                System.Console.WriteLine("{0} ({1}) - Added zone successfully.", zone.zoneId, zone.zoneName);
                SendAddZone(zone, clientMode);
            }
            else
            {
                System.Console.WriteLine("{0} ({1}) - Failed to add zone.", zone.zoneId, zone.zoneName);
                SendZoneError($"{zone.zoneId} ({zone.zoneName}) - Failed to add zone.", clientMode);
            }
        }
        catch (Exception ex)
        {
            System.Console.WriteLine("Error in HandleAddZone: " + ex.Message);
            System.Console.WriteLine("AAAAA");
        }
    }

    public void HandleRemoveZone(JsonElement data, ModeEnum clientMode)
    {
        try
        {
            Zone zone = data.Deserialize<Zone>();
            string zoneId = zone.zoneId;

            bool isRemoved = zonesDataManager.RemoveAndSaveZone(zoneId);
            if (isRemoved)
            {
                isRemoved = zoneManager.TryRemoveZone(zoneId); 
                if (isRemoved)
                {
                    System.Console.WriteLine("{0} ({1}) - Removed zone successfully.", zoneId, zone.zoneName);
                    SendRemoveDangerZone(zone, clientMode);
                }
                else
                {
                    System.Console.WriteLine("{0} ({1}) - Failed to remove zone.", zoneId, zone.zoneName);
                    SendZoneError($"{zoneId} ({zone.zoneName}) - Failed to remove zone.", clientMode);
                }
            }
            else
            {
                System.Console.WriteLine("{0} ({1}) - Failed to remove zone.", zoneId, zone.zoneName);
                SendZoneError($"{zoneId} ({zone.zoneName}) - Failed to remove zone from file.", clientMode);
            }
        }
        catch (Exception ex)
        {
            System.Console.WriteLine("Error in HandleRemoveDangerZone: " + ex.Message);
        }
    }

    public void HandleEditZone(JsonElement data, ModeEnum clientMode)
    {
        try
        {
            Zone zone = data.Deserialize<Zone>();
            string zoneId = zone.zoneId;

            bool isEdited = zonesDataManager.EditAndSaveZone(zoneId, zone); 
            if (isEdited)
            {
                isEdited = zoneManager.TryEditZone(zoneId, zone); 
                if (isEdited)
                {
                    System.Console.WriteLine("{0} ({1}) - Edited zone successfully.", zoneId, zone.zoneName);
                    SendEditDangerZone(zone, clientMode);
                }
                else
                {
                    System.Console.WriteLine("{0} ({1}) - Failed to edit zone.", zoneId, zone.zoneName);
                    SendZoneError($"{zoneId} ({zone.zoneName}) - Failed to edit zone.", clientMode);
                }
            }
            else
            {
                System.Console.WriteLine("{0} ({1}) - Failed to edit zone.", zoneId, zone.zoneName);
                SendZoneError($"{zoneId} ({zone.zoneName}) - Failed to edit zone from file.", clientMode);
            }
        }
        catch (Exception ex)
        {
            System.Console.WriteLine("Error in HandleEditDanger: " + ex.Message);
        }
    }

    public void SendAddZone(Zone zone, ModeEnum clientMode)
    {
        string zoneData =  WebSocketServer.prepareMessageToClient(S2CMessageType.AddZone, zone, clientMode);
        WebSocketServer.SendMsgToClients(zoneData, clientMode);
    }
    public void SendRemoveDangerZone(Zone zone, ModeEnum clientMode)
    {
        string zoneData =  WebSocketServer.prepareMessageToClient(S2CMessageType.RemoveZone, zone, clientMode);
        WebSocketServer.SendMsgToClients(zoneData, clientMode);
    }
    public void SendEditDangerZone(Zone zone, ModeEnum clientMode)
    {
        string zoneData =  WebSocketServer.prepareMessageToClient(S2CMessageType.EditZone, zone, clientMode);
        WebSocketServer.SendMsgToClients(zoneData, clientMode);
    }
    public void SendZoneError(string errorMsg, ModeEnum clientMode)
    {
        ZoneError zoneError = new ZoneError()
        {
            errorMsg = errorMsg
        };
        string zoneErrorData = WebSocketServer.prepareMessageToClient(S2CMessageType.ZoneError, zoneError, clientMode);
        WebSocketServer.SendMsgToClients(zoneErrorData, clientMode);
    }
}