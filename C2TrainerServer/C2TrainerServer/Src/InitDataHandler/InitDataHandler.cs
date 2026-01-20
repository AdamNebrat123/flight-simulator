using System.Net.WebSockets;

public class InitDataHandler
{
    private static InitDataHandler _instance;
    private readonly ScenariosDataManager scenariosDataManager = ScenariosDataManager.GetInstance();

    private InitDataHandler()
    {

    }

    public static InitDataHandler GetInstance()
    {
        if (_instance == null)
        {
            _instance = new InitDataHandler();
        }
        return _instance;
    }

    public void SendInitData(WebSocket webSocket)
    {
        // get scenarios
        scenariosDataManager.ReadData();
        List<Scenario> scenarios = scenariosDataManager.GetScenarios();


        InitData initData = new InitData()
        {
            scenarios = scenarios,
        };

        string initDataMsg = UIWebSocketServer.PrepareMessageToClient(S2CMessageType.InitData, initData, ModeEnum.ScenarioSimulator);
        UIWebSocketServer.SendMsgToClient(webSocket, initDataMsg);
    }
}