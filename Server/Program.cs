
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;

public class Program
{
    private static WebSocket? _webSocket;
    private static readonly UIMsgHandler _uiMsgHandler = new();

    public static async Task Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        var app = builder.Build();

        app.UseWebSockets();

        app.Use(async (context, next) =>
        {
            if (context.WebSockets.IsWebSocketRequest)
            {
                _webSocket = await context.WebSockets.AcceptWebSocketAsync();
                Console.WriteLine("WebSocket connected");

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
}

/*
using System.Text.Json;


// UI Msg Handler
UIMsgHandler UIMsgHandler = new UIMsgHandler();

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseWebSockets();

app.Use(async (context, next) =>
{
    if (context.WebSockets.IsWebSocketRequest)
    {
        using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
        Console.WriteLine("WebSocket connected");

        var buffer = new byte[1024 * 4];
        while (true)
        {
            var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
            if (result.MessageType == System.Net.WebSockets.WebSocketMessageType.Close)
            {
                Console.WriteLine("WebSocket closed");
                await webSocket.CloseAsync(System.Net.WebSockets.WebSocketCloseStatus.NormalClosure, "Closed by server", CancellationToken.None);
                break;
            }

            var jsonString = System.Text.Encoding.UTF8.GetString(buffer, 0, result.Count);
            Console.WriteLine("Received: " + jsonString);
            UIMsgHandler.HandleIncomingMessage(jsonString);



            
            //var echoMessage = $"Echo: {message}";
            //var bytes = System.Text.Encoding.UTF8.GetBytes(echoMessage);
            //await webSocket.SendAsync(new ArraySegment<byte>(bytes), result.MessageType, result.EndOfMessage, CancellationToken.None);
            
        }
    }
    else
    {
        await next();
    }
});

app.Run();

*/
