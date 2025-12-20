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
}