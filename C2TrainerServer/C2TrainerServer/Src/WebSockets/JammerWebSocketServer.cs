using System.Net.WebSockets;
using System.Text.Json;

public class JammerWebSocketServer : WebSocketServer<Sensor>
{
    public JammerWebSocketServer(int port) : base(port) {}

    protected override async Task RunAsync(CancellationToken token)
    {
        System.Console.WriteLine("open");
        OpenWebSocket();
        System.Console.WriteLine("after open");
        try
        {
            // i have the queue from the base class, when there is data in the Q, send it.
            foreach (Sensor jammer in _queue.GetConsumingEnumerable(token))
            {
                string msgType = JammerToC2ServerMsgType.JammerStatus.ToString();
                string json = prepareMessageToClient(msgType, jammer);
                await SendAsync(json);
                System.Console.WriteLine("Sent jammer status");
            }
        }
        catch (OperationCanceledException)
        {
            // expected on shutdown
        }

        CloseWebSocket();
    }
    protected override async Task OnClientConnectedAsync()
    {

    }
}