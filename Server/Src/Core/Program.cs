
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;

public class Program
{
    private static WebSocket? _webSocket;
    private static readonly UIMsgHandler _uiMsgHandler = new();

    public static async Task Main(string[] args)
    {
        // load existing data (if existing)
        LoadDataFromFiles();

        

        var builder = WebApplication.CreateBuilder(args);
        var app = builder.Build();

        app.UseWebSockets();

        app.Use(async (context, next) =>
        {
            if (context.WebSockets.IsWebSocketRequest)
            {
                _webSocket = await context.WebSockets.AcceptWebSocketAsync();
                Console.WriteLine("WebSocket connected");

                // send init data to client
                InitDataHandler initDataHandler = InitDataHandler.GetInstance();
                initDataHandler.SendInitData();

                var buffer = new byte[1024 * 4];
                while (true)
                {
                    var result = await _webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                    if (result.MessageType == WebSocketMessageType.Close)
                    {
                        Console.WriteLine("WebSocket closed");
                        await _webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closed by server", CancellationToken.None);
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
        if (_webSocket == null || _webSocket.State != WebSocketState.Open)
        {
            Console.WriteLine("WebSocket is not connected.");
            return;
        }

        var encoded = Encoding.UTF8.GetBytes(jsonString);

        await _webSocket.SendAsync(new ArraySegment<byte>(encoded), WebSocketMessageType.Text, true, CancellationToken.None);
        System.Console.WriteLine("sent: " + jsonString);
    }
    public static void LoadDataFromFiles()
    {
        ScenariosDataManager scenariosDataManager = ScenariosDataManager.GetInstance();
        scenariosDataManager.ReadData();

        List<PlanesTrajectoryPointsScenario> allSceanrios = scenariosDataManager.GetScenarios();
        PlanesTrajectoryPointsScenarioHandler scenarioHandler = PlanesTrajectoryPointsScenarioHandler.GetInstance();
        // calculate results of existing scenarios
        foreach (var scenario in allSceanrios)
        {
            scenarioHandler.CalculateScenarioReuslts(scenario);
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
