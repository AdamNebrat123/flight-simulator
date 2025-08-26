public class DangerZoneManager
{
    private static DangerZoneManager instance;
    private readonly Dictionary<string, DangerZone> _zones = new();
    private DangerZoneManager()
    {
    }
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

    public bool TryAddZone(string zoneName, DangerZone zone)
    {
        if (string.IsNullOrWhiteSpace(zoneName) || zone == null) return false;

        if (_zones.ContainsKey(zoneName))
            return false;

        _zones[zoneName] = zone;
        return true;
    }

    public DangerZone? TryGetZone(string zoneName)
    {
        if (string.IsNullOrWhiteSpace(zoneName)) return null;

        _zones.TryGetValue(zoneName, out var zone);
        return zone;
    }

    public bool TryRemoveZone(string zoneName)
    {
        if (string.IsNullOrWhiteSpace(zoneName)) return false;

        return _zones.Remove(zoneName);
    }
}