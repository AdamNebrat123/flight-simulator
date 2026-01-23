public class ScenarioWebsocketsManager
{
    private static readonly ScenarioWebsocketsManager _instance = new ScenarioWebsocketsManager();
    private ZonesWebSocketServer _zonesWS; // zones
    private List<JammerWebSocketServer> _jammersWS; // jammers
    private RadarWebSocketServer _radarWS; // radars

    private ScenarioWebsocketsManager()
    {

    }

    public static ScenarioWebsocketsManager GetInstance()
    {
        return _instance;
    }

    public void InitWebsocketsByConfig()
    {
        // init zones websocket
        _jammersWS = new List<JammerWebSocketServer>();

        int maxJammers = 5; // get from config

        // init jammers websockets
        /*for (int i = 0; i < maxJammers; i++)
        {
            int port = GetPortForJammer();
            var jammerWS = new JammerWebSocketServer(port);
            _jammersWS.Add(jammerWS);
        }
        */
        _jammersWS.Add(new JammerWebSocketServer(6001));
        _jammersWS.Add(new JammerWebSocketServer(6002));
        _jammersWS.Add(new JammerWebSocketServer(6003));
        _jammersWS.Add(new JammerWebSocketServer(6004));
        _jammersWS.Add(new JammerWebSocketServer(6005));
        // init radars websockets

        _radarWS = new RadarWebSocketServer(9002);

        // init zones websocket
        int zonePort = GetPortForZones();
        _zonesWS = new ZonesWebSocketServer(9001);
    }

    
    public int GetPortForJammer()
    {
        // logic to get port for jammer
        // it will be from config file 
        Random rand = new Random();
        int port = rand.Next(8000, 9000); // just a placeholder
        return port; 
    }
    public int GetPortForRadar()
    {
        // logic to get port for radar
        // it will be from config file 
        return 9002; // just a placeholder
    }
    public int GetPortForZones()
    {
        // logic to get port for zones
        // it will be from config file 
        return 9001; // just a placeholder
    }

    public ScenarioWebSocketAllocation AllocateForScenario(ScenarioResults scenarioResults)
    {
        var allocation = new ScenarioWebSocketAllocation(scenarioResults.scenarioId);

        var freeJammers = new Queue<JammerWebSocketServer>(_jammersWS);

        // set jammer websockets

        foreach (var jammer in scenarioResults.jammers.Values)
        {
            if (freeJammers.Count == 0)
                break;

            var ws = freeJammers.Dequeue();
            allocation.JammerMap[jammer.id] = ws;
        }
        // set radar websocket
        allocation.RadarWS = _radarWS;


        // set zones in zones websocket
        _zonesWS.SetZones(scenarioResults.zones.Values.ToList());
        // set zones websocket
        allocation.ZonesWS = _zonesWS;

        return allocation;
    }

    public async Task StopWebsocketsByAllocation(ScenarioWebSocketAllocation allocation)
    {
        Console.WriteLine("Stopping all websocket servers...");

        var stopTasks = new List<Task>();

        if (allocation.ZonesWS != null)
        {
            stopTasks.Add(allocation.ZonesWS.StopAsync());
        }

        foreach (var ws in allocation.JammerMap.Values)
        {
            stopTasks.Add(ws.StopAsync());
        }

        if (allocation.RadarWS != null)
        {
            stopTasks.Add(allocation.RadarWS.StopAsync());
        }

        await Task.WhenAll(stopTasks);

        await Task.Delay(500); 
        
        Console.WriteLine("All ports should be free now.");
    }

public async Task StartWebsocketsByAllocation(ScenarioWebSocketAllocation allocation)
{
    Console.WriteLine("Starting websocket servers by allocation...");

    // task.run used to not block the main server loop
    // because task.run takes a new thread from the thread pool and runs the start there
    
    _ = Task.Run(() => allocation.ZonesWS.StartAsync());

    _ = Task.Run(() => allocation.RadarWS.StartAsync());

    foreach (var ws in allocation.JammerMap.Values)
    {
        _ = Task.Run(() => ws.StartAsync());
    }


    Console.WriteLine("All websocket servers are now listening.");
    await Task.CompletedTask;
}
    public List<JammerWebSocketServer> GetJammersWS()
    {
        return _jammersWS;
    }
    public RadarWebSocketServer GetRadarWS()
    {
        return _radarWS;
    }
    public ZonesWebSocketServer GetZonesWS()
    {
        return _zonesWS;
    }

}