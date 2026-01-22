using System.Text.Json;

public class RadarHandler
{
    private static RadarHandler instance;
    private readonly PlayingScenarioData playingScenarioData = PlayingScenarioData.GetInstance();

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
        SkyPicture skyPicture = radarUpdate.skyPicture;

        // update the most recent radar update in current scenario data
        playingScenarioData.SetMostRecentSkyPicture(skyPicture);

        // Send to C2 UI
        string msg = UIWebSocketServer.PrepareMessageToClient(S2CMessageType.RadarUpdate, radarUpdate);
        UIWebSocketServer.SendMsgToClients(msg);
    }


}
