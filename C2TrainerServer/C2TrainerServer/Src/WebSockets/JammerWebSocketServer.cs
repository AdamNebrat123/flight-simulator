using System.Net.WebSockets;
using System.Text.Json;

public class JammerWebSocketServer : WebSocketServer
{
    public JammerWebSocketServer(int port) : base(port) {}

    protected override async Task RunAsync(CancellationToken token)
    {
        try
        {
            await Task.Run(async () => 
            {
                foreach (string json in _queue.GetConsumingEnumerable(token))
                {
                    // בדיקת תקינות הסוקט לפני שליחה
                    if (_socket == null || _socket.State != WebSocketState.Open)
                        break;

                    await SendAsync(json);
                }
            }, token);
        }
        catch (OperationCanceledException)
        {
            // expected on shutdown
        }
        catch (Exception ex)
        {
            System.Console.WriteLine($"[Port {_port}] Error in RunAsync: {ex.Message}");
        }
        
    }

    protected override async Task OnClientConnectedAsync()
    {
        System.Console.WriteLine($"[Port {_port}] Jammer websocket ready.");
        await Task.CompletedTask;
    }
}