using System.Text.Json;

public class DangerZoneHandler
{
    private readonly DangerZoneManager dangerZoneManager;
    public DangerZoneHandler(DangerZoneManager dangerZoneManager)
    {
        this.dangerZoneManager = dangerZoneManager;
    }
    public void handleDangerZone(JsonElement data)
    {
        DangerZone dangerZone = data.Deserialize<DangerZone>();
        string zoneName = dangerZone.zoneName;
        bool isAdded = dangerZoneManager.TryAddZone(zoneName, dangerZone);
        if (isAdded)
            System.Console.WriteLine(zoneName + " - Added zone successfully.");
        else
            System.Console.WriteLine(zoneName + " - Failed to add zone.");
    }
}