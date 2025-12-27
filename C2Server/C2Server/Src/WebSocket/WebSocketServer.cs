using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Collections.Concurrent;

public class WebSocketServer
{
    private static readonly WebSocketHandler _wsHandler = WebSocketHandler.GetInstance();
    private static readonly UIMsgHandler _uiMsgHandler = new();
    private static readonly WebSocketManager _wsManager = WebSocketManager.GetInstance();

    public static async Task Main(string[] args)
    {

        var builder = WebApplication.CreateBuilder(args);

        builder.WebHost.UseUrls("http://0.0.0.0:5000");

        var app = builder.Build();

        app.UseWebSockets();

        app.Use(async (context, next) =>
        {
            if (context.WebSockets.IsWebSocketRequest)
            {
                var webSocket = await context.WebSockets.AcceptWebSocketAsync();
                _wsHandler.HandleAddClient(webSocket);
                Console.WriteLine("WebSocket connected");

                

                var buffer = new byte[1024 * 4];
                while (true)
                {
                    var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                    if (result.MessageType == WebSocketMessageType.Close)
                    {
                        Console.WriteLine("WebSocket closed");
                        await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closed by server", CancellationToken.None);
                        _wsHandler.HandleRemoveClient(webSocket);
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
    public static string prepareMessageToClient<T>(S2CMessageType msgType, T msg)
    {
        var message = new
        {
            type = msgType.ToString(),
            data = msg,
        };
        return JsonSerializer.Serialize(message);
    }

    public static async Task SendMsgToClients(string jsonString)
    {
        foreach (var ws in _wsManager.GetConnections())
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
    
}
