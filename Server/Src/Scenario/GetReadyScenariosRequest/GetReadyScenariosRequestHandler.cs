using System.Text.Json;

public class GetReadyScenariosRequestHandler
{
    private static GetReadyScenariosRequestHandler _instance;
    private readonly TrajectoryScenarioResultsManager trajectoryScenarioResultsManager = TrajectoryScenarioResultsManager.GetInstance();

    private GetReadyScenariosRequestHandler()
    {
    }

    public static GetReadyScenariosRequestHandler GetInstance()
    {
        if (_instance == null)
            _instance = new GetReadyScenariosRequestHandler();
        return _instance;
    }

    public void HandleGetReadyScenariosRequestCmd(JsonElement data)
    {
        List<string> allScenariosNames = trajectoryScenarioResultsManager.GetAllScenariosNames();
        ScenariosReadyToPlay scenariosReadyToPlay = new ScenariosReadyToPlay
        {
            scenariosNames = allScenariosNames,
        };
        string response = Program.prepareMessageToClient(S2CMessageType.ScenariosReadyToPlay, scenariosReadyToPlay);
        Program.SendMsgToClient(response);
    }
}
