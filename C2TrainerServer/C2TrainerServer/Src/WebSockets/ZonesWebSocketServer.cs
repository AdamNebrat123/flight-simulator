using System.Text.Json;

public class ZonesWebSocketServer : WebSocketServer<Zone>
{
    public ZonesWebSocketServer(int port) : base(port) {}

    protected override async Task RunAsync(CancellationToken token)
    {
        OpenWebSocket();

        try
        {
            foreach (var zone in _queue.GetConsumingEnumerable(token))
            {
                string msgType = ZonesToC2ServerMsgType.Zones.ToString();
                string json = prepareMessageToClient(msgType, zone);
                await SendAsync(json);
            }
        }
        catch (OperationCanceledException)
        {
            // expected on shutdown
        }

        CloseWebSocket();
    }
}
