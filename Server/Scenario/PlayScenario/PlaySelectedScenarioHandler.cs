
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
        PlaySelectedScenarioCmd playSelecedScenario = data.Deserialize<PlaySelectedScenarioCmd>();
        string scenarioName = playSelecedScenario.scenarioName;
        ScenarioResults scenarioResults = trajectoryScenarioResultsManager.GetResults(scenarioName);
        if (scenarioResults != null)
            SendCalculatedTrajectoryPointsAsync(scenarioResults);
        else
            System.Console.WriteLine(scenarioName + " doesnt exist.....");
    }

    public async Task SendCalculatedTrajectoryPointsAsync(ScenarioResults scenario)
    {
        Console.WriteLine("entered SendCalculatedTrajectoryPointsAsync");

        foreach (MultiPlaneTrajectoryResult result in scenario.points)
        {
            while (scenario.isPaused)
            {
                await Task.Delay(100);
            }

            string responseJson = Program.prepareMessageToServer(
                MsgTypesEnum.MultiPlaneTrajectoryResult,
                result
            );

            Program.SendMsgToClient(responseJson);

            int adjustedDelay = (int)(timeStepSeconds * 1000 / scenario.playSpeed);
            await Task.Delay(adjustedDelay);
        }
        //set everything to deafult, so if scenario is played again its back to normal
        scenario.Resume();
        scenario.SetPlaySpeed(1.0);
    }
}