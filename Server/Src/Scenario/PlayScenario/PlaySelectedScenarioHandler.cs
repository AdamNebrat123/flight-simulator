using System.Text.Json;

public class PlaySelectedScenarioHandler
{
    private const double timeStepSeconds = 0.1;
    private readonly ScenarioResultsManager trajectoryScenarioResultsManager = ScenarioResultsManager.GetInstance();
    private readonly DangerZoneChecker dangerZoneChecker = new();

    private static PlaySelectedScenarioHandler _instance;

    private PlaySelectedScenarioHandler()
    {
    }

    public static PlaySelectedScenarioHandler GetInstance()
    {
        if (_instance == null)
            _instance = new PlaySelectedScenarioHandler();
        return _instance;
    }

    public void HandlePlaySelectedScenarioCmd(JsonElement data, ModeEnum clientMode)
    {
        PlaySelectedScenarioCmd playSelecedScenario = data.Deserialize<PlaySelectedScenarioCmd>();
        string scenarioId = playSelecedScenario.scenarioId;
        ScenarioResults scenarioResults = trajectoryScenarioResultsManager.GetScenarioResult(scenarioId);
        if (scenarioResults != null)
            SendCalculatedTrajectoryPointsAsync(scenarioResults, clientMode);
        else
            System.Console.WriteLine(scenarioId + " doesnt exist.....");
    }

    public async Task SendCalculatedTrajectoryPointsAsync(ScenarioResults scenario, ModeEnum clientMode)
    {
        Console.WriteLine("entered SendCalculatedTrajectoryPointsAsync");
        scenario.Resume();
        scenario.SetPlaySpeed(1.0);
        
        // a history of points for each plane by its name
        Dictionary<string, Queue<TrajectoryPoint>> history = new();
        foreach (ScenarioPlanesSnapshot result in scenario.points)
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
                    List<string> dangerZonesIn = dangerZoneChecker.GetZonesContainingPoint(currentPoint.position);
                    plane.dangerZonesIn = dangerZonesIn; // null if not in any zone

                    // set the boolean isInDangerZone
                    plane.isInDangerZone = dangerZonesIn.Count > 0;

                    // Keep max 30 points in history
                    if (history[plane.planeName].Count > 30)
                        history[plane.planeName].Dequeue();
                }

                // Update tailPoints from history
                plane.tailPoints = history[plane.planeName].ToList();
            }

            string responseJson = WebSocketServer.prepareMessageToClient(
                S2CMessageType.ScenarioPlanesSnapshot,
                result,
                clientMode
            );

            WebSocketServer.SendMsgToClients(responseJson, clientMode);

            int adjustedDelay = (int)(timeStepSeconds * 1000 / scenario.playSpeed);
            await Task.Delay(adjustedDelay);
        }

        // reset scenario defaults
        scenario.Resume();
        scenario.SetPlaySpeed(1.0);
    }
}
