using System.Text.Json;

public class RadarWebSocketServer : WebSocketServer<ScenarioAirCraftsSnapshot>
{
    public RadarWebSocketServer(int port) : base(port) {}

    protected override async Task RunAsync(CancellationToken token)
    {
        OpenWebSocket();

        try
        {
            foreach (var snapshot in _queue.GetConsumingEnumerable(token))
            {
                string msgType = RadarToC2ServerMsgType.RadarAircraftSnapthot.ToString();
                string json = prepareMessageToClient(msgType, snapshot);
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
