using System.Text.Json;

public class JammerHandler
{
    private static JammerHandler instance;

    private JammerHandler()
    {
    }

    public static JammerHandler GetInstance()
    {
        if (instance == null)
            instance = new JammerHandler();
        return instance;
    }

    private void HandleAddJammer(Jammer jammer)
    {
        try
        {
            // unique ID
            Guid uuid = Guid.NewGuid();
            jammer.id = uuid.ToString();
        }
        catch (Exception ex)
        {
            System.Console.WriteLine("Error in HandleAddJammer: " + ex.Message);
        }
    }

    public Dictionary<string, Sensor> CreateJammersDict(List<Sensor> jammers)
    {
        Dictionary<string, Sensor> jammerDict = new();
        foreach(Sensor jammer in jammers)
        {
            if(jammer.id == "")
                HandleAddJammer((Jammer)jammer);
                
            jammerDict.TryAdd(jammer.id, jammer);
        }
        return jammerDict;
    }
}
