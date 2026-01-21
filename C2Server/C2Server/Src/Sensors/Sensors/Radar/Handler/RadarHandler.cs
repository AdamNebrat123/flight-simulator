using System.Text.Json;

public class RadarHandler
{
    private static RadarHandler instance;

    private RadarHandler()
    {
    }

    public static RadarHandler GetInstance()
    {
        if (instance == null)
            instance = new RadarHandler();
        return instance;
    }

    private void HandleAddRadar(Radar radar)
    {
        try
        {
            // unique ID
            Guid uuid = Guid.NewGuid();
            radar.id = uuid.ToString();
        }
        catch (Exception ex)
        {
            System.Console.WriteLine("Error in HandleAddRadar: " + ex.Message);
        }
    }

    public Dictionary<string, Sensor> CreateRadarsDict(List<Sensor> radars)
    {
        Dictionary<string, Sensor> radarDict = new();
        foreach(Sensor radar in radars)
        {
            if(radar.id == "")
               HandleAddRadar((Radar)radar);
            radarDict.TryAdd(radar.id, radar);
        }
        return radarDict;
    }
}
