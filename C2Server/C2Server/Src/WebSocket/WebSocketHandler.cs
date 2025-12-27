using System.Net.WebSockets;

internal class WebSocketHandler
{
    private static readonly WebSocketHandler _instance = new WebSocketHandler();
    private readonly WebSocketManager _modeManager = WebSocketManager.GetInstance();

    private WebSocketHandler() {}
    public static WebSocketHandler GetInstance() => _instance;

    public void HandleAddClient(WebSocket socket)
    {
        _modeManager.AddConnection(socket);
    }

    public void HandleRemoveClient(WebSocket socket)
    {
        _modeManager.RemoveConnection(socket);
    }
}