using System.Collections.Concurrent;

public class CurrentScenarioData
{
    private static CurrentScenarioData _instance = new CurrentScenarioData();
    private ConcurrentDictionary<string, JammerWebSocketClient> _jammerIdToClientMap { get; } = new();
    private RadarWebSocketClient? _radarWS { get; set; }
    private ZonesWebSocketClient? _zonesWS { get; set; }
    private List<Zone> _zones = new();
    private RadarUpdate _mostRecentRadarUpdate;

    private CurrentScenarioData()
    {
    }
    public static CurrentScenarioData GetInstance()
    {
        return _instance;
    }

    public void RegisterJammerClient(string jammerId, JammerWebSocketClient client)
    {
        _jammerIdToClientMap[jammerId] = client;
    }
    public void Reset()
    {
        _jammerIdToClientMap.Clear();
        _zones.Clear();
        _mostRecentRadarUpdate = null;
    }
    public bool IsJammerAlreadySet(string jammerId)
    {
        return _jammerIdToClientMap.ContainsKey(jammerId);
    }
    public void AddJammerClientMapping(string jammerId, JammerWebSocketClient client)
    {
        _jammerIdToClientMap[jammerId] = client;
    }
    public void RemoveJammerClientMapping(string jammerId)
    {
        _jammerIdToClientMap.TryRemove(jammerId, out _);
    }
    public RadarWebSocketClient? GetRadarWS()
    {
        return _radarWS;
    }

    public void SetRadarWS(RadarWebSocketClient? radarWS)
    {
        _radarWS = radarWS;
    }

    public ZonesWebSocketClient? GetZonesWS()
    {
        return _zonesWS;
    }

    public void SetZonesWS(ZonesWebSocketClient? zonesWS)
    {
        _zonesWS = zonesWS;
    }

    public RadarUpdate GetMostRecentRadarUpdate()
    {
        return _mostRecentRadarUpdate;
    }

    public void SetMostRecentRadarUpdate(RadarUpdate update)
    {
        _mostRecentRadarUpdate = update;
    }

    // Zones
    public List<Zone> GetZones()
    {
        return _zones;
    }

    public void SetZones(List<Zone> zones)
    {
        _zones = zones;
    }
}