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
                _jammerMsgHandler.HandleIncomingMessage(this, json);
            }
        }
        catch (OperationCanceledException)
        {
            // expected on shutdown
        }
    }
    protected override Task OnDisconnectedAsync()
    {
        _jammerMsgHandler.HandleDisconnection(this);
        return Task.CompletedTask;
    }

}