using System.Text.Json;

public class RadarWebSocketServer : WebSocketServer<RadarUpdate>
{
    public RadarWebSocketServer(int port) : base(port) {}

    protected override async Task RunAsync(CancellationToken token)
    {
        OpenWebSocket();

        try
        {
            foreach (RadarUpdate radarUpdate in _queue.GetConsumingEnumerable(token))
            {
                string msgType = RadarToC2ServerMsgType.RadarAircraftSnapthot.ToString();
                string json = prepareMessageToClient(msgType, radarUpdate);
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
