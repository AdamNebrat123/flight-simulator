using System.Text.Json;

public class DangerZoneHandler
{
    private readonly DangerZoneManager dangerZoneManager = DangerZoneManager.GetInstance();
    private readonly DangerZonesDataManager dangerZonesDataManager = DangerZonesDataManager.GetInstance();
    public DangerZoneHandler()
    {
    }
    public void HandleAddDangerZone(JsonElement data)
    {
        DangerZone dangerZone = data.Deserialize<DangerZone>();
        Guid uuid = Guid.NewGuid();
        string uuidString = uuid.ToString();
        dangerZone.zoneId = uuidString;
        string zoneName = dangerZone.zoneName;
        // add in file
        dangerZonesDataManager.AddDangerZone(dangerZone);
        // add in a map 
        bool isAdded = dangerZoneManager.TryAddZone(dangerZone);
        if (isAdded)
        {
            System.Console.WriteLine(zoneName + " - Added zone successfully.");
            SendDangerZoneData(dangerZone);
        }
        else
        {
            System.Console.WriteLine(zoneName + " - Failed to add zone.");
            SendDangerZoneError(zoneName + " - Failed to add zone.");
        }
    }
    public void HandleRemoveDangerZone(JsonElement data)
    {
        DangerZone dangerZone = data.Deserialize<DangerZone>();
        string zoneName = dangerZone.zoneName;
        bool isRemoved = dangerZonesDataManager.RemoveDangerZone(zoneName);
        if (isRemoved)
        {
            isRemoved = dangerZoneManager.TryRemoveZone(zoneName);
            if (isRemoved)
            {
                System.Console.WriteLine(zoneName + " - Removed zone successfully.");
                SendDangerZoneData(dangerZone);
            }
            else
            {
                System.Console.WriteLine(zoneName + " - Failed to remove zone.");
                SendDangerZoneError(zoneName + " - Failed to remove zone.");
            }
        }
        else
        {
            SendDangerZoneError(zoneName + " - Failed to remove zone.");
        }
    }
    public void HandleEditDanger(JsonElement data)
    {
        DangerZone dangerZone = data.Deserialize<DangerZone>();
        string zoneName = dangerZone.zoneName;
        bool isEdited = dangerZonesDataManager.EditDangerZone(zoneName, dangerZone);
        if (isEdited)
        {
            isEdited = dangerZoneManager.TryEditDangerZone(zoneName, dangerZone);
            if (isEdited)
            {
                System.Console.WriteLine(zoneName + " - Edited zone successfully.");
                SendDangerZoneData(dangerZone);
            }
            else
            {
                System.Console.WriteLine(zoneName + " - Failed to edit zone.");
                SendDangerZoneError(zoneName + " - Failed to edit zone.");
            }
        }
        else
        {
            SendDangerZoneError(zoneName + " - Failed to edit zone.");
        }
    }

    public void SendDangerZoneData(DangerZone dangerZone)
    {
        string dangerZoneData =  Program.prepareMessageToClient(S2CMessageType.DangerZoneData, dangerZone);
        Program.SendMsgToClient(dangerZoneData);
    }
    public void SendDangerZoneError(string errorMsg)
    {
        DangerZoneError dangerZoneError = new DangerZoneError()
        {
            errorMsg = errorMsg
        };
        string dangerZoneErrorData =  Program.prepareMessageToClient(S2CMessageType.DangerZoneError, dangerZoneError);
        Program.SendMsgToClient(dangerZoneErrorData);
    }
}