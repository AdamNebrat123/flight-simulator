using System.Net.WebSockets;
using System.Text.Json;

public class ZonesWebSocketServer : WebSocketServer<Zone>
{
    private List<Zone> _zones = new List<Zone>();
    public ZonesWebSocketServer(int port) : base(port) {}

    protected override async Task RunAsync(CancellationToken token)
    {
        OpenWebSocket();

        try
        {
            foreach (var zone in _queue.GetConsumingEnumerable(token))
            {
                string msgType = ZonesToC2ServerMsgType.Zone.ToString();
                string json = prepareMessageToClient(msgType, zone);
                await SendAsync(json);
                System.Console.WriteLine("Sent zone");

            }
        }
        catch (OperationCanceledException)
        {
            // expected on shutdown
        }

        CloseWebSocket();
    }

    public void SetZones(List<Zone> zones)
    {
        _zones = zones;
    }
    protected override async Task OnClientConnectedAsync()
    {
        if(_zones != null && _zones.Count > 0)
        {
            foreach(Zone zone in _zones)
            {
                Enqueue(zone);
            }
        }
    }
}
