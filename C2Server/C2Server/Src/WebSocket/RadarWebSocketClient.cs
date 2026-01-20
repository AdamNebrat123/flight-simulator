using System.Text.Json;

public class RadarWebSocketClient : WebSocketClient
{
    private readonly RadarMsgHandler _radarMsgHandler = RadarMsgHandler.GetInstance();
    public RadarWebSocketClient(string url) : base(url) { }

    protected override async Task ProcessIncomingMessagesAsync(CancellationToken ct)
    {

        try
        {
            foreach (string json in _receiveQueue.GetConsumingEnumerable(ct))
            {
                _radarMsgHandler.HandleIncomingMessage(_socket, json);
            }
        }
        catch (OperationCanceledException)
        {
            // expected on shutdown
        }
    }

}