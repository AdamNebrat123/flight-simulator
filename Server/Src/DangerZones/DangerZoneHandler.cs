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
        try
        {
            DangerZone dangerZone = data.Deserialize<DangerZone>();
            Guid uuid = Guid.NewGuid();
            string uuidString = uuid.ToString();
            dangerZone.zoneId = uuidString;
            string zoneName = dangerZone.zoneName;

            // add in file
            dangerZonesDataManager.AddAndSaveDangerZone(dangerZone);

            // add in a map 
            bool isAdded = dangerZoneManager.TryAddZone(dangerZone);
            if (isAdded)
            {
                System.Console.WriteLine(zoneName + " - Added zone successfully.");
                SendAddDangerZone(dangerZone);
            }
            else
            {
                System.Console.WriteLine(zoneName + " - Failed to add zone.");
                SendDangerZoneError(zoneName + " - Failed to add zone.");
            }
        }
        catch (Exception ex)
        {
            System.Console.WriteLine("Error in HandleAddDangerZone: " + ex.Message);
        }
    }

    public void HandleRemoveDangerZone(JsonElement data)
    {
        try
        {
            DangerZone dangerZone = data.Deserialize<DangerZone>();
            string zoneName = dangerZone.zoneName;

            bool isRemoved = dangerZonesDataManager.RemoveAndSaveDangerZone(zoneName);
            if (isRemoved)
            {
                isRemoved = dangerZoneManager.TryRemoveZone(zoneName);
                if (isRemoved)
                {
                    System.Console.WriteLine(zoneName + " - Removed zone successfully.");
                    SendRemoveDangerZone(dangerZone);
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
        catch (Exception ex)
        {
            System.Console.WriteLine("Error in HandleRemoveDangerZone: " + ex.Message);
        }
    }

    public void HandleEditDangerZone(JsonElement data)
    {
        try
        {
            DangerZone dangerZone = data.Deserialize<DangerZone>();
            string zoneName = dangerZone.zoneName;

            bool isEdited = dangerZonesDataManager.EditAndSaveDangerZone(zoneName, dangerZone);
            if (isEdited)
            {
                isEdited = dangerZoneManager.TryEditDangerZone(zoneName, dangerZone);
                if (isEdited)
                {
                    System.Console.WriteLine(zoneName + " - Edited zone successfully.");
                    SendEditDangerZone(dangerZone);
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
        catch (Exception ex)
        {
            System.Console.WriteLine("Error in HandleEditDanger: " + ex.Message);
        }
    }

    public void SendAddDangerZone(DangerZone dangerZone)
    {
        string dangerZoneData =  Program.prepareMessageToClient(S2CMessageType.AddDangerZone, dangerZone);
        Program.SendMsgToClient(dangerZoneData);
    }
    public void SendRemoveDangerZone(DangerZone dangerZone)
    {
        string dangerZoneData =  Program.prepareMessageToClient(S2CMessageType.RemoveDangerZone, dangerZone);
        Program.SendMsgToClient(dangerZoneData);
    }
    public void SendEditDangerZone(DangerZone dangerZone)
    {
        string dangerZoneData =  Program.prepareMessageToClient(S2CMessageType.EditDangerZone, dangerZone);
        Program.SendMsgToClient(dangerZoneData);
    }
    public void SendDangerZoneError(string errorMsg)
    {
        DangerZoneError dangerZoneError = new DangerZoneError()
        {
            errorMsg = errorMsg
        };
        string dangerZoneErrorData = Program.prepareMessageToClient(S2CMessageType.DangerZoneError, dangerZoneError);
        Program.SendMsgToClient(dangerZoneErrorData);
    }
}