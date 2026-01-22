using System.Text.Json;

public class ZoneHandler
{
    private static ZoneHandler instance;
    //private readonly ZoneManager zoneManager = ZoneManager.GetInstance();
    private readonly PlayingScenarioData playingScenarioData = PlayingScenarioData.GetInstance();
    private ZoneHandler()
    {
    }
    public static ZoneHandler GetInstance()
    {
        if (instance == null)
        {
            instance = new ZoneHandler();
        }
        return instance;
    }

    public void HandleInitialZones(JsonElement data, ZonesWebSocketClient zonesWS)
    {
        InitialZones initialZones = JsonSerializer.Deserialize<InitialZones>(data);
        if (initialZones == null)
            return;

        playingScenarioData.SetZones(initialZones.zones);

        foreach (var zone in initialZones.zones)
        {
            SendAddZone(zone);
        }
    }
    public void SendAddZone(Zone zone)
    {
        string zoneData =  UIWebSocketServer.PrepareMessageToClient(S2CMessageType.AddZone, zone);
        UIWebSocketServer.SendMsgToClients(zoneData);
    }
}