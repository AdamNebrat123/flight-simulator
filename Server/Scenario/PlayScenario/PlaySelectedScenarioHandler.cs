
using System.Text.Json;

public class PlaySelectedScenarioHandler
{
    private const double timeStepSeconds = 0.1;
    private readonly TrajectoryScenarioResultsManager trajectoryScenarioResultsManager;
    private readonly DangerZoneChecker dangerZoneChecker = new();

    public PlaySelectedScenarioHandler(TrajectoryScenarioResultsManager trajectoryScenarioResultsManager)
    {
        this.trajectoryScenarioResultsManager = trajectoryScenarioResultsManager;
    }
    public void HandlePlaySelectedScenarioCmd(JsonElement data)
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

        // a history of points for each plane by its name
        Dictionary<string, Queue<TrajectoryPoint>> history = new();

        foreach (MultiPlaneTrajectoryResult result in scenario.points)
        {
            while (scenario.isPaused)
            {
                await Task.Delay(100);
            }

            foreach (PlaneCalculatedTrajectoryPoints plane in result.planes)
            {
                // Make sure every plane has a history queue
                if (!history.ContainsKey(plane.planeName))
                    history[plane.planeName] = new Queue<TrajectoryPoint>();

                // If there is a current point, add it to history
                if (plane.trajectoryPoints != null && plane.trajectoryPoints.Any())
                {
                    TrajectoryPoint currentPoint = plane.trajectoryPoints.First();
                    history[plane.planeName].Enqueue(currentPoint);

                    // Check if point is in danger zone
                    bool isInDangerZone = dangerZoneChecker.IsPointInAnyZone(currentPoint.position);
                    plane.isInDangerZone = isInDangerZone; 

                    // If i have passed 30 points  i will discard the oldest one
                    if (history[plane.planeName].Count > 30)
                        history[plane.planeName].Dequeue();
                }

                // Update tailPoints from historyy
                plane.tailPoints = history[plane.planeName].ToList();
            }


            string responseJson = Program.prepareMessageToServer(
                MsgTypesEnum.MultiPlaneTrajectoryResult,
                result
            );
            // send
            Program.SendMsgToClient(responseJson);

            int adjustedDelay = (int)(timeStepSeconds * 1000 / scenario.playSpeed);
            await Task.Delay(adjustedDelay);
        }

        //set everything to deafult, so if scenario is played again its back to normal
        scenario.Resume();
        scenario.SetPlaySpeed(1.0);
    }
}