public class WebSocketClientManager
{
    private static readonly WebSocketClientManager _instance = new WebSocketClientManager();
    public List<JammerWebSocketClient> Jammers { get; } = new();
    public RadarWebSocketClient? Radar { get; private set; }
    public ZonesWebSocketClient? Zones { get; private set; }


    private WebSocketClientManager()
    {
    }

    public static WebSocketClientManager GetInstance()
    {
        return _instance;
    }
    public void InitializeClients(string baseUrl, int zonesPort, int radarPort, List<int> jammerPorts)
    {
        Zones = new ZonesWebSocketClient($"ws://{baseUrl}:{zonesPort}");
        
        Radar = new RadarWebSocketClient($"ws://{baseUrl}:{radarPort}");

        foreach (var port in jammerPorts)
        {
            var jammer = new JammerWebSocketClient($"ws://{baseUrl}:{port}");
            Jammers.Add(jammer);
        }
    }

    public void StartAll()
    {
        Console.WriteLine("[Manager] Starting all WebSocket clients...");
        
        Zones?.Start();
        Radar?.Start();

        foreach (var jammer in Jammers)
        {
            jammer.Start();
        }
    }
}