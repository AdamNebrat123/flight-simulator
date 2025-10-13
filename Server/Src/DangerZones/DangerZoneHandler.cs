using System.Text.Json;

public class DangerZoneHandler
{
    private static DangerZoneHandler instance;
    private readonly DangerZoneManager dangerZoneManager = DangerZoneManager.GetInstance();
    private readonly DangerZonesDataManager dangerZonesDataManager = DangerZonesDataManager.GetInstance();
    
    private DangerZoneHandler()
    {
    }
    public static DangerZoneHandler GetInstance()
    {
        if (instance == null)
        {
            instance = new DangerZoneHandler();
        }
        return instance;
    }

    public void HandleAddDangerZone(JsonElement data, ModeEnum clientMode)
    {
        try
        {
            DangerZone dangerZone = data.Deserialize<DangerZone>();
            Guid uuid = Guid.NewGuid();
            string uuidString = uuid.ToString();
            dangerZone.zoneId = uuidString;


            // add in file
            dangerZonesDataManager.AddAndSaveDangerZone(dangerZone);

            // add in a map 
            bool isAdded = dangerZoneManager.TryAddZone(dangerZone);
            if (isAdded)
            {
                System.Console.WriteLine("{0} ({1}) - Added zone successfully.", dangerZone.zoneId, dangerZone.zoneName);
                SendAddDangerZone(dangerZone, clientMode);
            }
            else
            {
                System.Console.WriteLine("{0} ({1}) - Failed to add zone.", dangerZone.zoneId, dangerZone.zoneName);
                SendDangerZoneError($"{dangerZone.zoneId} ({dangerZone.zoneName}) - Failed to add zone.", clientMode);
            }
        }
        catch (Exception ex)
        {
            System.Console.WriteLine("Error in HandleAddDangerZone: " + ex.Message);
        }
    }

    public void HandleRemoveDangerZone(JsonElement data, ModeEnum clientMode)
    {
        try
        {
            DangerZone dangerZone = data.Deserialize<DangerZone>();
            string zoneId = dangerZone.zoneId;

            bool isRemoved = dangerZonesDataManager.RemoveAndSaveDangerZone(zoneId);
            if (isRemoved)
            {
                isRemoved = dangerZoneManager.TryRemoveZone(zoneId); 
                if (isRemoved)
                {
                    System.Console.WriteLine("{0} ({1}) - Removed zone successfully.", zoneId, dangerZone.zoneName);
                    SendRemoveDangerZone(dangerZone, clientMode);
                }
                else
                {
                    System.Console.WriteLine("{0} ({1}) - Failed to remove zone.", zoneId, dangerZone.zoneName);
                    SendDangerZoneError($"{zoneId} ({dangerZone.zoneName}) - Failed to remove zone.", clientMode);
                }
            }
            else
            {
                System.Console.WriteLine("{0} ({1}) - Failed to remove zone.", zoneId, dangerZone.zoneName);
                SendDangerZoneError($"{zoneId} ({dangerZone.zoneName}) - Failed to remove zone from file.", clientMode);
            }
        }
        catch (Exception ex)
        {
            System.Console.WriteLine("Error in HandleRemoveDangerZone: " + ex.Message);
        }
    }

    public void HandleEditDangerZone(JsonElement data, ModeEnum clientMode)
    {
        try
        {
            DangerZone dangerZone = data.Deserialize<DangerZone>();
            string zoneId = dangerZone.zoneId;

            bool isEdited = dangerZonesDataManager.EditAndSaveDangerZone(zoneId, dangerZone); 
            if (isEdited)
            {
                isEdited = dangerZoneManager.TryEditDangerZone(zoneId, dangerZone); 
                if (isEdited)
                {
                    System.Console.WriteLine("{0} ({1}) - Edited zone successfully.", zoneId, dangerZone.zoneName);
                    SendEditDangerZone(dangerZone, clientMode);
                }
                else
                {
                    System.Console.WriteLine("{0} ({1}) - Failed to edit zone.", zoneId, dangerZone.zoneName);
                    SendDangerZoneError($"{zoneId} ({dangerZone.zoneName}) - Failed to edit zone.", clientMode);
                }
            }
            else
            {
                System.Console.WriteLine("{0} ({1}) - Failed to edit zone.", zoneId, dangerZone.zoneName);
                SendDangerZoneError($"{zoneId} ({dangerZone.zoneName}) - Failed to edit zone from file.", clientMode);
            }
        }
        catch (Exception ex)
        {
            System.Console.WriteLine("Error in HandleEditDanger: " + ex.Message);
        }
    }

    public void SendAddDangerZone(DangerZone dangerZone, ModeEnum clientMode)
    {
        string dangerZoneData =  WebSocketServer.prepareMessageToClient(S2CMessageType.AddDangerZone, dangerZone, clientMode);
        WebSocketServer.SendMsgToClients(dangerZoneData, clientMode);
    }
    public void SendRemoveDangerZone(DangerZone dangerZone, ModeEnum clientMode)
    {
        string dangerZoneData =  WebSocketServer.prepareMessageToClient(S2CMessageType.RemoveDangerZone, dangerZone, clientMode);
        WebSocketServer.SendMsgToClients(dangerZoneData, clientMode);
    }
    public void SendEditDangerZone(DangerZone dangerZone, ModeEnum clientMode)
    {
        string dangerZoneData =  WebSocketServer.prepareMessageToClient(S2CMessageType.EditDangerZone, dangerZone, clientMode);
        WebSocketServer.SendMsgToClients(dangerZoneData, clientMode);
    }
    public void SendDangerZoneError(string errorMsg, ModeEnum clientMode)
    {
        DangerZoneError dangerZoneError = new DangerZoneError()
        {
            errorMsg = errorMsg
        };
        string dangerZoneErrorData = WebSocketServer.prepareMessageToClient(S2CMessageType.DangerZoneError, dangerZoneError, clientMode);
        WebSocketServer.SendMsgToClients(dangerZoneErrorData, clientMode);
    }
}