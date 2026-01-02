using System.Text.Json;

public class JammerWebSocketServer : WebSocketServer<Sensor>
{
    public JammerWebSocketServer(int port) : base(port) {}

    protected override async Task RunAsync(CancellationToken token)
    {
        OpenWebSocket();

        try
        {
            // i have the queue from the base class, when there is data in the Q, send it.
            foreach (var jammer in _queue.GetConsumingEnumerable(token))
            {
                string msgType = JammerToC2ServerMsgType.JammerUpdate.ToString();
                string json = prepareMessageToClient("asdasd", jammer);
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