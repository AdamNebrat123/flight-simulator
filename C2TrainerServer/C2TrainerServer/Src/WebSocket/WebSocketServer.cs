using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Collections.Concurrent;

public class WebSocketServer
{
    private static readonly WebSocketModeHandler _modeHandler = WebSocketModeHandler.GetInstance();
    // Removed: _webSockets, now using WebSocketModeManager
    private static readonly UIMsgHandler _uiMsgHandler = new();
    private static readonly WebSocketModeManager _modeManager = WebSocketModeManager.GetInstance();

    public static async Task Main(string[] args)
    {
        // load existing data (if existing)
        LoadDataFromFiles();

        var builder = WebApplication.CreateBuilder(args);

        builder.WebHost.UseUrls("http://0.0.0.0:5000");

        var app = builder.Build();

        app.UseWebSockets();

        BulletsMsgSender.GetInstance().Start(); // Start sending bullet messages to clients


        app.Use(async (context, next) =>
        {
            if (context.WebSockets.IsWebSocketRequest)
            {
                var webSocket = await context.WebSockets.AcceptWebSocketAsync();
                Console.WriteLine("WebSocket connected");

                

                var buffer = new byte[1024 * 4];
                while (true)
                {
                    var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                    if (result.MessageType == WebSocketMessageType.Close)
                    {
                        Console.WriteLine("WebSocket closed");
                        await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closed by server", CancellationToken.None);
                        _modeHandler.HandleRemoveClient(webSocket);
                        break;
                    }

                    var jsonString = Encoding.UTF8.GetString(buffer, 0, result.Count);
                    Console.WriteLine("Received: " + jsonString);
                    await _uiMsgHandler.HandleIncomingMessage(webSocket, jsonString);

                }
            }
            else
            {
                await next();
            }
        });

        app.Run();
    }
    public static string prepareMessageToClient<T>(S2CMessageType msgType, T msg, ModeEnum mode)
    {
        var message = new
        {
            type = msgType.ToString(),
            data = msg,
            mode = mode.ToString()
        };
        return JsonSerializer.Serialize(message);
    }

    public static async Task SendMsgToClients(string jsonString, ModeEnum mode)
    {
        var connections = _modeManager.GetConnectionsInMode(mode);
        foreach (var ws in connections)
        {
            if (ws.State == WebSocketState.Open)
            {
                var encoded = Encoding.UTF8.GetBytes(jsonString);
                await ws.SendAsync(new ArraySegment<byte>(encoded), WebSocketMessageType.Text, true, CancellationToken.None);
            }
        }
    }
    public static async Task SendMsgToClient(WebSocket connection, string jsonString)
    {
        if (connection.State == WebSocketState.Open)
        {
            var encoded = Encoding.UTF8.GetBytes(jsonString);
            await connection.SendAsync(
                new ArraySegment<byte>(encoded),
                WebSocketMessageType.Text,
                true,
                CancellationToken.None
            );
            Console.WriteLine("sent to specific client: " + jsonString);
        }
    }
    public static void LoadDataFromFiles()
    {
        ScenariosDataManager scenariosDataManager = ScenariosDataManager.GetInstance();
        scenariosDataManager.ReadData();

        List<Scenario> allSceanrios = scenariosDataManager.GetScenarios();
        ScenarioManager scenarioManager = ScenarioManager.GetInstance();
        ScenarioResultsCalculator scenarioResultsCalculator = ScenarioResultsCalculator.GetInstance();
        ScenarioResultsManager scenarioResultsManager = ScenarioResultsManager.GetInstance();

        // calculate results of existing scenarios
        foreach (var scenario in allSceanrios)
        {
            // store existing scenario in a map from a file
            bool isAdded = scenarioManager.TryAddScenario(scenario);
            if (isAdded)
            {
                System.Console.WriteLine("{0} ({1}) - Added scenario successfully.", scenario.scenarioId, scenario.scenarioName);
                ScenarioResults scenarioResults = scenarioResultsCalculator.CalculateScenarioResults(scenario)!;
                // save the calculated scenario
                scenarioResultsManager.TryAddScenario(scenario.scenarioId, scenarioResults);
            }
            else
            {
                System.Console.WriteLine("{0} ({1}) - Failed to add scenario.", scenario.scenarioId, scenario.scenarioName);
            }
        }

        ZonesDataManager zonesDataManager = ZonesDataManager.GetInstance();
        zonesDataManager.ReadData();

        List<Zone> allZones = zonesDataManager.GetZones();
        ZoneManager zoneManager = ZoneManager.GetInstance();

        // store all existing zones in a map from a file
        foreach (var zone in allZones)
        {
            bool isAdded = zoneManager.TryAddZone(zone);
            if (isAdded)
                System.Console.WriteLine(zone.zoneName + " - Added zone successfully.");
            else
                System.Console.WriteLine(zone.zoneName + " - Failed to add zone.");
        }

        JammersDataManager jammersDataManager = JammersDataManager.GetInstance();
        jammersDataManager.ReadData();

        List<Jammer> allJammers = jammersDataManager.GetJammers();
        JammerManager jammerManager = JammerManager.GetInstance();

        // store all existing jammers in a map from a file
        foreach( var jammer in allJammers)
        {
            bool isAdded = jammerManager.TryAddJammer(jammer);
            if (isAdded)
                System.Console.WriteLine(jammer.id + " - Added jammer successfully.");
            else
                System.Console.WriteLine(jammer.id + " - Failed to add jammer.");
        }

    }
}
