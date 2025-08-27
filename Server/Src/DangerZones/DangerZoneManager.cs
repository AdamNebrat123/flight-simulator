public class DangerZoneManager
{
    private static DangerZoneManager instance;
    private readonly Dictionary<string, DangerZone> _zones = new();

    private DangerZoneManager() { }

    public static DangerZoneManager GetInstance()
    {
        if (instance == null)
            instance = new DangerZoneManager();
        return instance;
    }

    public IEnumerable<DangerZone> GetAllZones()
    {
        return _zones.Values;
    }

    public bool TryAddZone(DangerZone zone)
    {
        if (zone == null || string.IsNullOrWhiteSpace(zone.zoneId))
            return false;

        if (_zones.ContainsKey(zone.zoneId))
            return false;

        _zones[zone.zoneId] = zone;
        return true;
    }

    public DangerZone? TryGetZone(string zoneId)
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

    public bool TryEditDangerZone(string zoneId, DangerZone updatedZone)
    {
        if (string.IsNullOrWhiteSpace(zoneId) || updatedZone == null)
            return false;

        if (!_zones.ContainsKey(zoneId))
            return false;

        _zones[zoneId] = updatedZone;
        return true;
    }
}
