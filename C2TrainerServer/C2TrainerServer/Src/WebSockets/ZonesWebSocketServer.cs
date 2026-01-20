using System.Net.WebSockets;
using System.Text.Json;

public class ZonesWebSocketServer : WebSocketServer<Zone>
{
    private List<Zone> _zones = new List<Zone>();

    public ZonesWebSocketServer(int port) : base(port) {}

    public void SetZones(List<Zone> zones)
    {
        _zones = zones;
    }

    protected override async Task OnClientConnectedAsync()
    {
        if (_zones != null && _zones.Count > 0)
        {
            foreach (Zone zone in _zones)
            {
                Enqueue(zone);
            }
        }
        await Task.CompletedTask;
    }

    protected override async Task RunAsync(CancellationToken token)
    {
        try
        {
            await Task.Run(async () =>
            {
                foreach (var zone in _queue.GetConsumingEnumerable(token))
                {
                    if (_socket == null || _socket.State != WebSocketState.Open)
                        break;

                    string msgType = ZonesToC2ServerMsgType.Zone.ToString();
                    string json = prepareMessageToClient(msgType, zone);
                    
                    await SendAsync(json);
                    System.Console.WriteLine($"[Zones Port {_port}] Sent zone update");
                }
            }, token);
        }
        catch (OperationCanceledException)
        {
        }
        catch (Exception ex)
        {
            System.Console.WriteLine($"[Zones Port {_port}] Error: {ex.Message}");
        }

    }
}