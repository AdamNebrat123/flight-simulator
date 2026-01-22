using System.Net.WebSockets;
using System.Text.Json;

public class RadarWebSocketServer : WebSocketServer
{
    public RadarWebSocketServer(int port) : base(port) {}

    protected override async Task RunAsync(CancellationToken token)
    {
        
        try
        {
            await Task.Run(async () =>
            {
                foreach (string json in _queue.GetConsumingEnumerable(token))
                {
                    if (_socket == null || _socket.State != WebSocketState.Open)
                        break;

                    await SendAsync(json);
                    System.Console.WriteLine($"[Radar Port {_port}] Sent update to client");
                }
            }, token);
        }
        catch (OperationCanceledException)
        {
        }
        catch (Exception ex)
        {
            System.Console.WriteLine($"[Radar Port {_port}] Error: {ex.Message}");
        }

    }

    protected override async Task OnClientConnectedAsync()
    {
        System.Console.WriteLine($"[Radar Port {_port}] Client connected and synchronized.");
        await Task.CompletedTask;
    }
}