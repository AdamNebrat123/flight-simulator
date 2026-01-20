using System.Text.Json;

public class JammerWebSocketClient : WebSocketClient
{
    private readonly JammerMsgHandler _jammerMsgHandler = JammerMsgHandler.GetInstance();
    public JammerWebSocketClient(string url) : base(url) { }

    protected override async Task ProcessIncomingMessagesAsync(CancellationToken ct)
    {
        try
        {
            foreach (string json in _receiveQueue.GetConsumingEnumerable(ct))
            {
                _jammerMsgHandler.HandleIncomingMessage(_socket, json);
            }
        }
        catch (OperationCanceledException)
        {
            // expected on shutdown
        }
    }

}