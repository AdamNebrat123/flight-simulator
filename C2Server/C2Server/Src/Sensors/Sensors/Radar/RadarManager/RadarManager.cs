public class RadarManager
{
    private static RadarManager instance = new RadarManager();
    private readonly Dictionary<string, Radar> _radars = new();

    private RadarManager()
    {
    }

    public static RadarManager GetInstance()
    {
        if (instance == null)
            instance = new RadarManager();
        return instance;
    }
    public bool TryAddRadar(Radar radar)
    {
        if (_radars.ContainsKey(radar.id))
            return false;

        _radars[radar.id] = radar;
        return true;
    }

    public bool TryRemoveRadar(string id)
    {
        return _radars.Remove(id);
    }

    public bool TryEditRadar(string id, Radar updatedRadar)
    {
        if (!_radars.ContainsKey(id))
            return false;

        _radars[id] = updatedRadar;
        return true;
    }

    public Radar? GetRadarById(string id)
    {
        return _radars.TryGetValue(id, out Radar? radar) ? radar : null;
    }
}