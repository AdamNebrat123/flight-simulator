public class JammerManager
{
    private static JammerManager _instance = new JammerManager();
    private readonly Dictionary<string, Jammer> _jammers = new();

    private JammerManager()
    {
        
    }

    public static JammerManager GetInstance()
    {
        return _instance;
    }

    public bool TryAddJammer(Jammer jammer)
    {
        if (_jammers.ContainsKey(jammer.id))
            return false;

        _jammers[jammer.id] = jammer;
        return true;
    }

    public bool TryRemoveJammer(string id)
    {
        return _jammers.Remove(id);
    }

    public bool TryEditJammer(string id, Jammer updatedJammer)
    {
        if (!_jammers.ContainsKey(id))
            return false;

        _jammers[id] = updatedJammer;
        return true;
    }

    public Jammer? GetJammerById(string id)
    {
        return _jammers.TryGetValue(id, out Jammer? jammer) ? jammer : null;
    }
    public List<Jammer> GetAllJammers()
    {
        return _jammers.Values.ToList();
    }
    public List<Jammer> GetJammersByIds(List<string>? ids)
    {
        var result = new List<Jammer>();

        if (ids == null || ids.Count == 0)
            return result; 

        foreach (var id in ids)
        {
            if (string.IsNullOrWhiteSpace(id))
                continue;

            Jammer? jammer = GetJammerById(id);
            if (jammer != null)
                result.Add(jammer);
        }

        return result;
    }
    public JammersSnapshot CreateSnapshot()
    {
        return new JammersSnapshot(_jammers);
    }
}