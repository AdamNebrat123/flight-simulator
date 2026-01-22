using System.Text.Json;

public class RadarHandler
{
    private static RadarHandler instance;
    private readonly CurrentScenarioData currentScenarioData = CurrentScenarioData.GetInstance();

    private RadarHandler()
    {
    }

    public static RadarHandler GetInstance()
    {
        if (instance == null)
            instance = new RadarHandler();
        return instance;
    }

    public void HandleRadarUpdate(JsonElement data, RadarWebSocketClient radarWS)
    {
        RadarUpdate radarUpdate = JsonSerializer.Deserialize<RadarUpdate>(data);
        
        // update the most recent radar update in current scenario data
        currentScenarioData.SetMostRecentRadarUpdate(radarUpdate);
    }


}
