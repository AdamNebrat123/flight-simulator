using System.Text.Json;

public class PlaySelectedScenarioHandler
{
    public const double timeStepSeconds = 0.1;
    private readonly ScenarioResultsManager trajectoryScenarioResultsManager = ScenarioResultsManager.GetInstance();
    private readonly ScenarioWebsocketsManager scenarioWebsocketsManager = ScenarioWebsocketsManager.GetInstance();

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

    public async Task SendCalculatedTrajectoryPointsAsync(
    ScenarioResults originalScenario,
    ModeEnum clientMode)
    {


        var history = new Dictionary<string, Queue<TrajectoryPoint>>();

        originalScenario.Resume();
        originalScenario.SetPlaySpeed(1.0);

        // set current ScenarioResults
        ScenarioResults scenarioCopy = trajectoryScenarioResultsManager.GetCopyOfScenarioResult(originalScenario.scenarioId);
        //////////////////////////////////////////////////////////jammerAssignmentManager.SetScenarioResults(originalScenario, scenarioCopy);

        Dictionary<string, AircraftRuntimeData>? runtimeAircrafts = scenarioCopy.Aircrafts;

        while (runtimeAircrafts.Values.Any(a => a.Trajectory.Count > 0))
        {
            while (originalScenario.isPaused)
                await Task.Delay(100);

            var snapshot = new ScenarioAirCraftsSnapshot(new List<AircraftStatus>())
            {
                scenarioId = originalScenario.scenarioId
            };

            foreach (var aircraft in runtimeAircrafts.Values)
            {
                if (aircraft.Trajectory.Count == 0)
                    continue;

                var point = aircraft.Trajectory.Dequeue();

                if (!history.ContainsKey(aircraft.AircraftId))
                    history[aircraft.AircraftId] = new Queue<TrajectoryPoint>();

                history[aircraft.AircraftId].Enqueue(point);
                if (history[aircraft.AircraftId].Count > 30)
                    history[aircraft.AircraftId].Dequeue();


                AircraftStatus aircraftStatus = aircraft.Aircraft.CreateStatus(point);


                aircraftStatus.tailPoints = history[aircraft.AircraftId].ToList();

                snapshot.aircrafts.Add(aircraftStatus);
            }


            RadarUpdate radarUpdate = new RadarUpdate(snapshot);
            List<RadarWebSocketServer> radarsWS = scenarioWebsocketsManager.GetRadarsWS();
            // i assume one radar per scenario for now
            RadarWebSocketServer radarWS = radarsWS.FirstOrDefault();;
            if (radarWS != null)
            {
                radarWS.Enqueue(radarUpdate);
            }

            int delay = (int)(timeStepSeconds * 1000 / originalScenario.playSpeed);
            await Task.Delay(delay);
        }
        // reset scenario defaults
        originalScenario.Resume();
        originalScenario.SetPlaySpeed(1.0);
    }


}
