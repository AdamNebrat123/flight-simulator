using System.Text.Json;

public class PlaySelectedScenarioHandler
{
    private const double JammerAssignmentIntervalSeconds = 1.0; // interval to re-evaluate jammer assignments
    private double _timeSinceLastJammerAssignment = 0.0;
    private const double timeStepSeconds = 0.1;
    private readonly ScenarioResultsManager trajectoryScenarioResultsManager = ScenarioResultsManager.GetInstance();
    private readonly ZoneChecker zoneChecker = new();
    private readonly JammerAssignmentManager jammerAssignmentManager = JammerAssignmentManager.GetInstance();

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
        // Deep copy to runtime
        var runtimeAircrafts = originalScenario.Aircrafts.ToDictionary(
            kvp => kvp.Key,
            kvp => new AircraftRuntimeData
            {
                AircraftId = kvp.Value.AircraftId,
                Aircraft = kvp.Value.Aircraft,
                Trajectory = new Queue<TrajectoryPoint>(kvp.Value.Trajectory)
            });

        var history = new Dictionary<string, Queue<TrajectoryPoint>>();

        originalScenario.Resume();
        originalScenario.SetPlaySpeed(1.0);

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

                List<string>? zones = zoneChecker.GetZonesContainingPoint(point.position);

                AircraftStatus aircraftStatus = aircraft.Aircraft.CreateStatus(point);

                aircraftStatus.dangerZonesIn = zones;
                aircraftStatus.isInDangerZone = zones.Count > 0;
                aircraftStatus.tailPoints = history[aircraft.AircraftId].ToList();

                snapshot.aircrafts.Add(aircraftStatus);
            }


            // Handle jammer assignments if needed
            _timeSinceLastJammerAssignment += timeStepSeconds / originalScenario.playSpeed;
            if (_timeSinceLastJammerAssignment >= JammerAssignmentIntervalSeconds)
            {
                _timeSinceLastJammerAssignment = 0.0;
                jammerAssignmentManager.AssignJammers(snapshot);
            }

            string msg = WebSocketServer.prepareMessageToClient(
                S2CMessageType.ScenarioPlanesSnapshot,
                snapshot,
                clientMode
            );

            WebSocketServer.SendMsgToClients(msg, clientMode);

            int delay = (int)(timeStepSeconds * 1000 / originalScenario.playSpeed);
            await Task.Delay(delay);
        }
        // reset scenario defaults
        originalScenario.Resume();
        originalScenario.SetPlaySpeed(1.0);
    }
}
