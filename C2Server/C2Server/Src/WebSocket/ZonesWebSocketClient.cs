using System.Text.Json;

public class ZonesWebSocketClient : WebSocketClient
{
    private readonly ZonesMsgHandler _zonesMsgHandler = ZonesMsgHandler.GetInstance();
    public ZonesWebSocketClient(string url) : base(url) { }
    
    protected override async Task ProcessIncomingMessagesAsync(CancellationToken ct)
    {
        try
        {
            foreach (string json in _receiveQueue.GetConsumingEnumerable(ct))
            {
                System.Console.WriteLine("JSON:           " + json);
                _zonesMsgHandler.HandleIncomingMessage(this, json);
            }
        }
        catch (OperationCanceledException)
        {
            // expected on shutdown
        }
    }

}