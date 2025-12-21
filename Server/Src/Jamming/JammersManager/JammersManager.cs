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

    public void AddJammer(Jammer jammer)
    {
        _jammers[jammer.id] = jammer;
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