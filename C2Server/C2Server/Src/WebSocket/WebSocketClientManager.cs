using System.Collections.Concurrent;

public class WebSocketClientManager
{
    private static readonly WebSocketClientManager _instance = new WebSocketClientManager();
    private List<JammerWebSocketClient> _jammers { get; } = new();
    private RadarWebSocketClient? _radar { get; set; }
    private ZonesWebSocketClient? _zones { get; set; }

    

    private WebSocketClientManager()
    {
    }

    public static WebSocketClientManager GetInstance()
    {
        return _instance;
    }
    

    public void InitializeClients(string baseUrl, int zonesPort, int radarPort, List<int> jammerPorts)
    {
        _zones = new ZonesWebSocketClient($"ws://{baseUrl}:{zonesPort}");
        
        _radar = new RadarWebSocketClient($"ws://{baseUrl}:{radarPort}");

        foreach (var port in jammerPorts)
        {
            var jammer = new JammerWebSocketClient($"ws://{baseUrl}:{port}");
            _jammers.Add(jammer);
        }
    }

    public void StartAll()
    {
        Console.WriteLine("[Manager] Starting all WebSocket clients...");
        
        _zones?.Start();
        _radar?.Start();

        foreach (var jammer in _jammers)
        {
            jammer.Start();
        }
    }
}