public class InitDataHandler
{
    private static InitDataHandler _instance;
    private readonly ScenariosDataManager scenariosDataManager = ScenariosDataManager.GetInstance();
    private readonly DangerZonesDataManager dangerZonesDataManager = DangerZonesDataManager.GetInstance();

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

    public void SendInitData()
    {
        // get scenarios
        scenariosDataManager.ReadData();
        List<Scenario> scenarios = scenariosDataManager.GetScenarios();

        // get DangerZones
        dangerZonesDataManager.ReadData();
        List<DangerZone> dangerZones = dangerZonesDataManager.GetDangerZones();

        InitData initData = new InitData()
        {
            scenarios = scenarios,
            dangerZones = dangerZones
        };

        string initDataMsg = WebSocketServer.prepareMessageToClient(S2CMessageType.InitData, initData);
        WebSocketServer.SendMsgToClients(initDataMsg);
    }
}