using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Collections.Concurrent;

public abstract class WebSocketServer
{
    protected BlockingCollection<string> _queue = new();
    protected readonly int _port;
    protected WebApplication? _app; 
    protected WebSocket? _socket; 

    protected WebSocketServer(int port)
    {
        _port = port;
    }


    public async Task StartAsync(CancellationToken token = default)
    {
        _queue = new BlockingCollection<string>();
        var builder = WebApplication.CreateBuilder();

        builder.WebHost.ConfigureKestrel(options =>
        {
            options.ListenAnyIP(_port);
        });

        _app = builder.Build();
        _app.UseWebSockets();

        _app.Map("/", async context =>
        {
            if (!context.WebSockets.IsWebSocketRequest)
            {
                context.Response.StatusCode = 400;
                return;
            }

            _socket = await context.WebSockets.AcceptWebSocketAsync();
            Console.WriteLine($"[WS] Client connected on port {_port}");

            await OnClientConnectedAsync();
            await RunAsync(token);
        });

        Console.WriteLine($"[WS] Listening on port {_port}");
        await _app.RunAsync(token);
    }

    public void Stop()
    {
        //_queue.CompleteAdding();
        _socket?.CloseAsync(WebSocketCloseStatus.NormalClosure, "Stopped", CancellationToken.None).Wait();
        _app?.StopAsync().Wait();
    }

    public void Enqueue(string data) => _queue.Add(data);
    protected abstract Task RunAsync(CancellationToken token);
    protected abstract Task OnClientConnectedAsync();

    protected async Task SendAsync(string data)
    {
        if (_socket == null || _socket.State != WebSocketState.Open)
            return;

        var encoded = Encoding.UTF8.GetBytes(data);
        await _socket.SendAsync(
            new ArraySegment<byte>(encoded),
            WebSocketMessageType.Text,
            true,
            CancellationToken.None
        );
    }

    public static string prepareMessageToClient<TMsg>(string msgType, TMsg msg)
    {
        var message = new
        {
            type = msgType,
            data = msg,
        };
        return JsonSerializer.Serialize(message);
    }
}