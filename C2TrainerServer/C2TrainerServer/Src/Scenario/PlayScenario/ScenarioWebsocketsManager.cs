public class ScenarioWebsocketsManager
{
    private static readonly ScenarioWebsocketsManager _instance = new ScenarioWebsocketsManager();
    private ZonesWebSocketServer ZonesWS; // zones
    private List<JammerWebSocketServer> jammersWS; // jammers
    private List<RadarWebSocketServer> radarsWS; // radars

    private ScenarioWebsocketsManager()
    {

    }

    public static ScenarioWebsocketsManager GetInstance()
    {
        return _instance;
    }

    public void InitWebsocketsByConfig(ScenarioResults scenarioResults)
    {
        // init zones websocket
        jammersWS = new List<JammerWebSocketServer>();
        radarsWS = new List<RadarWebSocketServer>();

        // init jammers websockets
        foreach (var jammer in scenarioResults.jammers.Values)
        {
            int port = GetPortForJammerFromConfigFile(jammer.id);
            var jammerWS = new JammerWebSocketServer(port);
            jammersWS.Add(jammerWS);
            jammerWS.Start();
            jammerWS.Stop();
        }

        // init radars websockets
        foreach (var radar in scenarioResults.radars.Values)
        {
            int port = GetPortForRadarFromConfigFile(radar.id);
            var radarWS = new RadarWebSocketServer(port);
            radarsWS.Add(radarWS);

            radarWS.Start();
            radarWS.Stop();
        }
    }

    public void StartWebsockets(ScenarioResults scenarioResults)
    {
        foreach (var jammer in jammersWS)
        {
            jammer.Start();
        }
        foreach (var radar in radarsWS)
        {
            radar.Start();
        }
        ZonesWS.Start();
    }
    public void StopWebsockets()
    {
        ZonesWS.Stop();
        foreach (var jammer in jammersWS)
        {
            jammer.Stop();
        }
        foreach (var radar in radarsWS)
        {
            radar.Stop();
        }
    }
    private int GetPortForJammerFromConfigFile(string jammerId)
    {
        // logic to get port for jammer
        // it will be from config file 
        return 1; // just a placeholder
    }
    private int GetPortForRadarFromConfigFile(string radarId)
    {
        // logic to get port for radar
        // it will be from config file 
        return 1; // just a placeholder
    }

    public List<JammerWebSocketServer> GetJammersWS()
    {
        return jammersWS;
    }
    public List<RadarWebSocketServer> GetRadarsWS()
    {
        return radarsWS;
    }
    public ZonesWebSocketServer GetZonesWS()
    {
        return ZonesWS;
    }

}