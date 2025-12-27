using System.Text.Json;

public class ZoneHandler
{
    private static ZoneHandler instance;
    
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

    private void HandleAddZone(Zone zone)
    {
        try
        {
            Guid uuid = Guid.NewGuid();
            string uuidString = uuid.ToString();
            zone.zoneId = uuidString;
        }
        catch (Exception ex)
        {
            System.Console.WriteLine("Error in HandleAddZone: " + ex.Message);
        }
    }

    public Dictionary<string, Zone> CreateZonesDict(List<Zone> zones)
    {
        Dictionary<string, Zone> zonesDict = new();
        foreach(Zone zone in zones)
        {
            if(zone.zoneId == "")
                HandleAddZone(zone);
            zonesDict.TryAdd(zone.zoneId, zone);
        }
        return zonesDict;
    }

}