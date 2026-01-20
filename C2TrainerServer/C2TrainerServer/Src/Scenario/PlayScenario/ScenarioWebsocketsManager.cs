public class ScenarioWebsocketsManager
{
    private static readonly ScenarioWebsocketsManager _instance = new ScenarioWebsocketsManager();
    private ZonesWebSocketServer _zonesWS; // zones
    private List<JammerWebSocketServer> _jammersWS; // jammers
    private List<RadarWebSocketServer> _radarsWS; // radars

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
        _radarsWS = new List<RadarWebSocketServer>();

        int maxJammers = 5; // get from config
        int maxRadars = 1; // get from config

        // init jammers websockets
        for (int i = 0; i < maxJammers; i++)
        {
            int port = GetPortForJammer();
            var jammerWS = new JammerWebSocketServer(port);
            _jammersWS.Add(jammerWS);
        }

        // init radars websockets
        for (int i = 0; i < maxRadars; i++)
        {
            int port = GetPortForRadar();
            var radarWS = new RadarWebSocketServer(port);
            _radarsWS.Add(radarWS);
        }

        // init zones websocket
        int zonePort = GetPortForZones();
        _zonesWS = new ZonesWebSocketServer(zonePort);
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
        return 9001; // just a placeholder
    }
    public int GetPortForZones()
    {
        // logic to get port for zones
        // it will be from config file 
        return 9002; // just a placeholder
    }

    public ScenarioWebSocketAllocation AllocateForScenario(ScenarioResults scenarioResults)
    {
        if(scenarioResults == null)
            System.Console.WriteLine("scenarioResults is null in AllocateForScenario");
        var allocation = new ScenarioWebSocketAllocation(scenarioResults.scenarioId);

        var freeJammers = new Queue<JammerWebSocketServer>(_jammersWS);
        var freeRadars  = new Queue<RadarWebSocketServer>(_radarsWS);

        // set jammer websockets
        foreach (var jammer in scenarioResults.jammers.Values)
        {
            if (freeJammers.Count == 0)
                break;

            var ws = freeJammers.Dequeue();
            allocation.JammerMap[jammer.id] = ws;
        }

        // set radar websockets
        foreach (var radar in scenarioResults.radars.Values)
        {
            if (freeRadars.Count == 0)
                break;

            var ws = freeRadars.Dequeue();
            allocation.RadarMap[radar.id] = ws;
        }

        allocation.ZonesWS = _zonesWS;

        return allocation;
    }

public async Task StopWebsocketsByAllocation(ScenarioWebSocketAllocation allocation)
{
    Console.WriteLine("Stopping all websocket servers...");

    // סגירת ה-Zones
    allocation.ZonesWS.Stop();

    // סגירת כל ה-Jammers
    foreach (var ws in allocation.JammerMap.Values)
        ws.Stop();

    // סגירת כל ה-Radars
    foreach (var ws in allocation.RadarMap.Values)
        ws.Stop();


    // small delay to ensure OS has released the ports completely
    await Task.Delay(500); 
    
    Console.WriteLine("All ports should be free now.");
}

public async Task StartWebsocketsByAllocation(ScenarioWebSocketAllocation allocation)
{
    Console.WriteLine("Starting websocket servers by allocation...");

    // task.run used to not block the main server loop
    // because task.run takes a new thread from the thread pool and runs the start there
    
    _ = Task.Run(() => allocation.ZonesWS.StartAsync());

    foreach (var ws in allocation.JammerMap.Values)
    {
        _ = Task.Run(() => ws.StartAsync());
    }

    foreach (var ws in allocation.RadarMap.Values)
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
    public List<RadarWebSocketServer> GetRadarsWS()
    {
        return _radarsWS;
    }
    public ZonesWebSocketServer GetZonesWS()
    {
        return _zonesWS;
    }

}