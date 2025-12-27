public class ZoneManager
{
    private static ZoneManager instance;
    private readonly Dictionary<string, Zone> _zones = new();

    private ZoneManager() { }

    public static ZoneManager GetInstance()
    {
        if (instance == null)
            instance = new ZoneManager();
        return instance;
    }

    public List<Zone> GetAllZones()
    {
        return _zones.Values.ToList();
    }

    public bool TryAddZone(Zone zone)
    {
        if (zone == null || string.IsNullOrWhiteSpace(zone.zoneId))
            return false;

        if (_zones.ContainsKey(zone.zoneId))
            return false;

        _zones[zone.zoneId] = zone;
        return true;
    }

    public Zone? TryGetZone(string zoneId)
    {
        if (string.IsNullOrWhiteSpace(zoneId))
            return null;

        _zones.TryGetValue(zoneId, out var zone);
        return zone;
    }

    public bool TryRemoveZone(string zoneId)
    {
        if (string.IsNullOrWhiteSpace(zoneId))
            return false;

        return _zones.Remove(zoneId);
    }

    public bool TryEditZone(string zoneId, Zone updatedZone)
    {
        if (string.IsNullOrWhiteSpace(zoneId) || updatedZone == null)
            return false;

        if (!_zones.ContainsKey(zoneId))
            return false;

        _zones[zoneId] = updatedZone;
        return true;
    }
}
