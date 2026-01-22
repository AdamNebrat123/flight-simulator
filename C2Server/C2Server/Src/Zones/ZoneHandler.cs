using System.Text.Json;

public class ZoneHandler
{
    private static ZoneHandler instance;
    private readonly ZoneManager zoneManager = ZoneManager.GetInstance();
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

    public void HandleInitialZones(JsonElement data, ZonesWebSocketClient zonesWS)
    {
        InitialZones initialZones = JsonSerializer.Deserialize<InitialZones>(data);
        if (initialZones == null)
            return;
        foreach (var zone in initialZones.zones)
        {
            AddZone(zone);
        }
    }
    private void AddZone(Zone zone)
    {
        try
        {
            bool isAdded = zoneManager.TryAddZone(zone);
            if (isAdded)
            {
                System.Console.WriteLine("{0} ({1}) - Added zone successfully.", zone.zoneId, zone.zoneName);
            }
            else
            {
                System.Console.WriteLine("{0} ({1}) - Failed to add zone.", zone.zoneId, zone.zoneName);
            }
        }
        catch (Exception ex)
        {
            System.Console.WriteLine("Error in HandleAddZone: " + ex.Message);
        }
    }

    public void HandleRemoveZone(JsonElement data)
    {
        try
        {
            Zone zone = data.Deserialize<Zone>();
            string zoneId = zone.zoneId;

            var isRemoved = zoneManager.TryRemoveZone(zoneId); 
            if (isRemoved)
            {
                System.Console.WriteLine("{0} ({1}) - Removed zone successfully.", zoneId, zone.zoneName);
            }
            else
            {
                System.Console.WriteLine("{0} ({1}) - Failed to remove zone.", zoneId, zone.zoneName);
            }
        }
        catch (Exception ex)
        {
            System.Console.WriteLine("Error in HandleRemoveDangerZone: " + ex.Message);
        }
    }

    public void HandleEditZone(JsonElement data)
    {
        try
        {
            Zone zone = data.Deserialize<Zone>();
            string zoneId = zone.zoneId;

            var isEdited = zoneManager.TryEditZone(zoneId, zone); 
            if (isEdited)
            {
                System.Console.WriteLine("{0} ({1}) - Edited zone successfully.", zoneId, zone.zoneName);
            }
            else
            {
                System.Console.WriteLine("{0} ({1}) - Failed to edit zone.", zoneId, zone.zoneName);
            }
        }
        catch (Exception ex)
        {
            System.Console.WriteLine("Error in HandleEditDanger: " + ex.Message);
        }
    }
}