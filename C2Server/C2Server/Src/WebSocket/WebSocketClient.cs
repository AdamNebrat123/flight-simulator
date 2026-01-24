using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Collections.Concurrent;

public abstract class WebSocketClient
{
    protected readonly Uri _serverUri;
    protected readonly BlockingCollection<string> _sendQueue = new();
    protected readonly BlockingCollection<string> _receiveQueue = new();
    protected ClientWebSocket? _socket;
    private readonly CancellationTokenSource _cts = new();
    
    protected WebSocketClient(string url)
    {
        _serverUri = new Uri(url);
    }

    public void Start()
    {
        Task.Run(() => ConnectionLoopAsync(_cts.Token));
        
        Task.Run(() => SendLoopAsync(_cts.Token));
        
        Task.Run(() => ProcessIncomingMessagesAsync(_cts.Token));
    }

    private async Task ConnectionLoopAsync(CancellationToken ct)
    {
        while (!ct.IsCancellationRequested)
        {
            bool wasConnected = false; 
            try
            {
                _socket = new ClientWebSocket();
                
                await _socket.ConnectAsync(_serverUri, ct);
                
                wasConnected = true; 
                Console.WriteLine($"[Client] Connected to {_serverUri}!");

                await ReceiveLoopAsync(ct);
            }
            catch (Exception ex)
            {
            }
            finally
            {
                _socket?.Dispose();
                _socket = null;

                if (wasConnected)
                {
                    wasConnected = false;
                    _ = OnDisconnectedAsync();
                }

                // reconnect delay
                await Task.Delay(1000, ct);
            }
        }
    }

    private async Task ReceiveLoopAsync(CancellationToken ct)
    {
        var buffer = new byte[1024 * 1024];
        while (_socket?.State == WebSocketState.Open && !ct.IsCancellationRequested)
        {
            WebSocketReceiveResult result;
            try
            {
                result = await _socket.ReceiveAsync(new ArraySegment<byte>(buffer), ct);
            }
            catch
            {
                break; 
            }
            
            if (result.MessageType == WebSocketMessageType.Close) break;

            var message = Encoding.UTF8.GetString(buffer, 0, result.Count);
            _receiveQueue.Add(message);
        }
    }

    private async Task SendLoopAsync(CancellationToken ct)
    {
        foreach (var msg in _sendQueue.GetConsumingEnumerable(ct))
        {
            while ((_socket == null || _socket.State != WebSocketState.Open) && !ct.IsCancellationRequested)
            {
                await Task.Delay(100, ct);
            }

            try
            {
                var bytes = Encoding.UTF8.GetBytes(msg);
                await _socket!.SendAsync(new ArraySegment<byte>(bytes), WebSocketMessageType.Text, true, ct);
            }
            catch { }
        }
    }

    public void EnqueueOutgoing(string json) => _sendQueue.Add(json);
    protected abstract Task OnDisconnectedAsync();
    public virtual string prepareMessageToClient<T>(string msgType, T msg)
    {
        var message = new { type = msgType, data = msg };
        return JsonSerializer.Serialize(message);
    }

    protected abstract Task ProcessIncomingMessagesAsync(CancellationToken ct);

}