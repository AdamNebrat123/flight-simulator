using System.Net;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Collections.Concurrent;

public abstract class WebSocketServer<T>
{
    protected readonly BlockingCollection<T> _queue = new();
    protected CancellationTokenSource _cts;

    protected HttpListener _listener;
    protected WebSocket? _socket;

    protected readonly int _port;

    protected WebSocketServer(int port)
    {
        _port = port;
    }

    public void Start()
    {
        _cts = new CancellationTokenSource();
        Task.Run(() => RunAsync(_cts.Token));
    }

    public void Stop()
    {
        _cts.Cancel();
        _queue.CompleteAdding();
        CloseWebSocket();
    }

    public void Enqueue(T data) => _queue.Add(data);

    protected abstract Task RunAsync(CancellationToken token);
    protected abstract Task OnClientConnectedAsync();

    protected void OpenWebSocket()
    {
        System.Console.WriteLine("OpenWebSocket");
        _listener = new HttpListener();
        _listener.Prefixes.Add($"http://0.0.0.0:{_port}/");
        _listener.Start();

        Console.WriteLine($"[WS] Listening on port {_port}");

        var context = _listener.GetContext(); // blocking
        if (!context.Request.IsWebSocketRequest)
            throw new InvalidOperationException("Not a websocket request");

        var wsContext = context.AcceptWebSocketAsync(null).GetAwaiter().GetResult();
        _socket = wsContext.WebSocket;

        Console.WriteLine($"[WS] Client connected on port {_port}");

        OnClientConnectedAsync().GetAwaiter().GetResult();
    }

    protected void CloseWebSocket()
    {
        try
        {
            if (_socket != null && _socket.State == WebSocketState.Open)
            {
                _socket.CloseAsync(
                    WebSocketCloseStatus.NormalClosure,
                    "Scenario ended",
                    CancellationToken.None
                ).Wait();
            }
        }
        catch { /* deliberately ignored */ }

        _socket?.Dispose();
        _listener?.Stop();

        Console.WriteLine($"[WS] Closed port {_port}");
    }

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
    public virtual string prepareMessageToClient<T>(string msgType, T msg)
    {
        var message = new
        {
            type = msgType,
            data = msg,
        };
        return JsonSerializer.Serialize(message);
    }
}
