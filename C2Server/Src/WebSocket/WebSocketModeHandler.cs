using System.Net.WebSockets;

public class WebSocketModeHandler
{
    private static readonly WebSocketModeHandler _instance = new WebSocketModeHandler();
    private readonly WebSocketModeManager _modeManager = WebSocketModeManager.GetInstance();

    private WebSocketModeHandler() {}
    public static WebSocketModeHandler GetInstance() => _instance;

    public void HandleClientModeMsg(WebSocket socket, ModeEnum clientMode)
    {
        _modeManager.AddConnection(socket, clientMode);

        if (clientMode == ModeEnum.ScenarioSimulator)
        {
            // send init data to client
            InitDataHandler initDataHandler = InitDataHandler.GetInstance();
            initDataHandler.SendInitData(socket);
        }
    }

    public void HandleRemoveClient(WebSocket socket)
    {
        _modeManager.RemoveConnection(socket);
    }
}