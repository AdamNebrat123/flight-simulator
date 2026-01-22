using System.Collections.Concurrent;

public class PlayingScenarioData
{
    private static PlayingScenarioData _instance = new PlayingScenarioData();
    private ConcurrentDictionary<string, JammerWebSocketClient> _jammerIdToClientMap { get; } = new();
    private RadarWebSocketClient? _radarWS { get; set; }
    private ZonesWebSocketClient? _zonesWS { get; set; }
    private List<Zone> _zones = new();
    private SkyPicture _mostRecentSkyPicture;

    private PlayingScenarioData()
    {
    }
    public static PlayingScenarioData GetInstance()
    {
        return _instance;
    }

    public void RegisterJammerClient(string jammerId, JammerWebSocketClient client)
    {
        _jammerIdToClientMap[jammerId] = client;
    }
    public void ClearJammerIdToClientMap()
    {
        _jammerIdToClientMap.Clear();
    }
    public void ClearZones()
    {
        _zones.Clear();
    }
    public void ClearMostRecentRadarUpdate()
    {
        _mostRecentSkyPicture = null;
    }
    public bool IsJammerAlreadySet(string jammerId)
    {
        return _jammerIdToClientMap.ContainsKey(jammerId);
    }
    public void TryAddJammerClientMapping(string jammerId, JammerWebSocketClient client)
    {
        if(!IsJammerAlreadySet(jammerId))
            _jammerIdToClientMap[jammerId] = client;
    }
    public bool IsJammerIdToClientMapEmpty()
    {
        return _jammerIdToClientMap.IsEmpty;
    }
    public void TryRemoveJammerClientMapping(string jammerId)
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

    public SkyPicture GetMostRecentSkyPicture()
    {
        return _mostRecentSkyPicture;
    }

    public void SetMostRecentSkyPicture(SkyPicture skyPicture)
    {
        _mostRecentSkyPicture = skyPicture;
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