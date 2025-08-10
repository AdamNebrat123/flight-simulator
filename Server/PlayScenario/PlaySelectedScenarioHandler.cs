
using System.Text.Json;

public class PlaySelectedScenarioHandler
{
    private const double timeStepSeconds = 0.1;
    private readonly TrajectoryScenarioResultsManager trajectoryScenarioResultsManager;
    public PlaySelectedScenarioHandler(TrajectoryScenarioResultsManager trajectoryScenarioResultsManager)
    {
        this.trajectoryScenarioResultsManager = trajectoryScenarioResultsManager;
    }
    public void HandlePlaySelectedScenario(JsonElement data)
    {
        PlaySelectedScenario playSelecedScenario = data.Deserialize<PlaySelectedScenario>();
        string scenarioName = playSelecedScenario.scenarioName;
        List<MultiPlaneTrajectoryResult> results = trajectoryScenarioResultsManager.GetResults(scenarioName);
        SendCalculatedTrajectoryPointsAsync(results);
    }
    
    public async Task SendCalculatedTrajectoryPointsAsync(List<MultiPlaneTrajectoryResult> results)
    {
        System.Console.WriteLine("entered SendCalculatedTrajectoryPointsAsync");
        foreach (var result in results)
        {
            var responseJson = Program.prepareMessageToServer(MsgTypesEnum.MultiPlaneTrajectoryResult, result);

            Program.SendMsgToClient(responseJson);

            await Task.Delay((int)(timeStepSeconds * 1000)); // wait timeStepSeconds * 1000 between each step
        }
    }
}