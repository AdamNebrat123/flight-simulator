    using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;

public static class UIWebSocketServer
{
    private static readonly WebSocketModeHandler _modeHandler = WebSocketModeHandler.GetInstance();
    private static readonly UIMsgHandler _uiMsgHandler = new();
    private static readonly WebSocketModeManager _modeManager = WebSocketModeManager.GetInstance();

    public static void Start()
    {
        var builder = WebApplication.CreateBuilder();

        builder.WebHost.UseUrls("http://0.0.0.0:5000");

        var app = builder.Build();

        app.UseWebSockets();

        app.Use(async (context, next) =>
        {
            if (context.WebSockets.IsWebSocketRequest)
            {
                var webSocket = await context.WebSockets.AcceptWebSocketAsync();
                Console.WriteLine("[UI WS] WebSocket connected");

                var buffer = new byte[1024 * 4];

                try
                {
                    while (true)
                    {
                        var result = await webSocket.ReceiveAsync(
                            new ArraySegment<byte>(buffer),
                            CancellationToken.None
                        );

                        if (result.MessageType == WebSocketMessageType.Close)
                        {
                            Console.WriteLine("[UI WS] WebSocket closed");
                            await webSocket.CloseAsync(
                                WebSocketCloseStatus.NormalClosure,
                                "Closed by server",
                                CancellationToken.None
                            );

                            _modeHandler.HandleRemoveClient(webSocket);
                            break;
                        }

                        var jsonString = Encoding.UTF8.GetString(buffer, 0, result.Count);

                        // ALL of the msg handling
                        await _uiMsgHandler.HandleIncomingMessage(webSocket, jsonString);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine("[UI WS] Error: " + ex.Message);
                    _modeHandler.HandleRemoveClient(webSocket);
                }
            }
            else
            {
                await next();
            }
        });

        app.Run();
    }

    // ------------------- Outgoing -------------------

    public static string PrepareMessageToClient<T>(
        S2CMessageType msgType,
        T msg,
        ModeEnum mode)
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
                await ws.SendAsync(
                    new ArraySegment<byte>(encoded),
                    WebSocketMessageType.Text,
                    true,
                    CancellationToken.None
                );
            }
        }
    }

    public static async Task SendMsgToClient(WebSocket connection, string jsonString)
    {
        if (connection.State != WebSocketState.Open)
            return;

        var encoded = Encoding.UTF8.GetBytes(jsonString);

        await connection.SendAsync(
            new ArraySegment<byte>(encoded),
            WebSocketMessageType.Text,
            true,
            CancellationToken.None
        );
    }
}
