using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Collections.Concurrent;

public class WebSocketServer
{
    private static readonly ConcurrentBag<WebSocket> _webSockets = new();
    private static readonly UIMsgHandler _uiMsgHandler = new();

    public static async Task Main(string[] args)
    {
        // load existing data (if existing)
        LoadDataFromFiles();

        

        var builder = WebApplication.CreateBuilder(args);

        builder.WebHost.UseUrls("http://0.0.0.0:5000");

        var app = builder.Build();

        app.UseWebSockets();

        app.Use(async (context, next) =>
        {
            if (context.WebSockets.IsWebSocketRequest)
            {
                var webSocket = await context.WebSockets.AcceptWebSocketAsync();
                _webSockets.Add(webSocket);
                Console.WriteLine("WebSocket connected");

                // send init data to client
                InitDataHandler initDataHandler = InitDataHandler.GetInstance();
                initDataHandler.SendInitData();

                var buffer = new byte[1024 * 4];
                while (true)
                {
                    var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                    if (result.MessageType == WebSocketMessageType.Close)
                    {
                        Console.WriteLine("WebSocket closed");
                        await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closed by server", CancellationToken.None);
                        _webSockets.TryTake(out webSocket); // Remove closed socket
                        break;
                    }

                    var jsonString = Encoding.UTF8.GetString(buffer, 0, result.Count);
                    Console.WriteLine("Received: " + jsonString);
                    _uiMsgHandler.HandleIncomingMessage(jsonString);

                }
            }
            else
            {
                await next();
            }
        });

        app.Run();
    }
    public static string prepareMessageToClient<T>(S2CMessageType msgType, T msg)
    {
        var message = new
        {
            type = msgType.ToString(),
            data = msg
        };

        return JsonSerializer.Serialize(message);
    }

    public static async Task SendMsgToClient(string jsonString)
    {
        foreach (var ws in _webSockets.ToArray())
        {
            if (ws.State == WebSocketState.Open)
            {
                var encoded = Encoding.UTF8.GetBytes(jsonString);
                await ws.SendAsync(new ArraySegment<byte>(encoded), WebSocketMessageType.Text, true, CancellationToken.None);
                System.Console.WriteLine("sent: " + jsonString);
            }
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

        DangerZonesDataManager dangerZonesDataManager = DangerZonesDataManager.GetInstance();
        dangerZonesDataManager.ReadData();

        List<DangerZone> allDangerZones = dangerZonesDataManager.GetDangerZones();
        DangerZoneManager dangerZoneManager = DangerZoneManager.GetInstance();

        // store all existing danger zones in a map from a file
        foreach (var dangerZone in allDangerZones)
        {
            bool isAdded = dangerZoneManager.TryAddZone(dangerZone);
            if (isAdded)
                System.Console.WriteLine(dangerZone.zoneName + " - Added zone successfully.");
            else
                System.Console.WriteLine(dangerZone.zoneName + " - Failed to add zone.");
        }
    }
}
