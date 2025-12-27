using System.Text.Json;

public class ScenarioResultsCalculator
{
    private const double timeStepSeconds = 0.1;

    private static ScenarioResultsCalculator _instance;
    private readonly ZoneHandler zoneHandler = ZoneHandler.GetInstance();
    private readonly JammerHandler jammerHandler = JammerHandler.GetInstance();
    private readonly RadarHandler radarHandler = RadarHandler.GetInstance();

    private ScenarioResultsCalculator()
    {
    }

    public static ScenarioResultsCalculator GetInstance()
    {
        if (_instance == null)
            _instance = new ScenarioResultsCalculator();
        return _instance;
    }

    public ScenarioResults? CalculateScenarioResults(Scenario scenario)
    {
        if (scenario?.aircrafts == null)
            return null;

        var aircraftsDict = new Dictionary<string, AircraftRuntimeData>();

        foreach (AircraftTrajectory aircraft in scenario.aircrafts)
        {
            List<TrajectoryPoint> trajectory = HandleSinglePlane(aircraft);

            aircraftsDict[aircraft.aircraftId] = new AircraftRuntimeData
            {
                AircraftId = aircraft.aircraftId,
                Aircraft = aircraft,
                Trajectory = new Queue<TrajectoryPoint>(trajectory)
            };
        }

        Dictionary<string, Sensor> jammersDict = jammerHandler.CreateJammersDict(scenario.jammers);
        Dictionary<string, Zone> zonesDict = zoneHandler.CreateZonesDict(scenario.zones);
        Dictionary<string, Sensor> radarsDict = radarHandler.CreateRadarsDict(scenario.radars);

        return new ScenarioResults
        {
            scenarioId = scenario.scenarioId,
            scenarioName = scenario.scenarioName,
            Aircrafts = aircraftsDict,
            zones = zonesDict,
            jammers = jammersDict,
            radars = radarsDict,
            isPaused = false,
            playSpeed = 1.0
        };
    }

    private List<TrajectoryPoint> HandleSinglePlane(AircraftTrajectory plane)
    {
        List<TrajectoryPoint> fullTrajectory = new List<TrajectoryPoint>();

        for (int i = 0; i < plane.geoPoints.Count - 1; i++)
        {
            GeoPoint start = plane.geoPoints[i];
            GeoPoint end = plane.geoPoints[i + 1];

            TrajectoryCalculator calculator = new TrajectoryCalculator();
            List<TrajectoryPoint> segment = calculator.ComputeTrajectory(start, end, plane.velocity, timeStepSeconds);

            if (i > 0 && segment.Count > 0)
            {
                segment.RemoveAt(0); // Avoid duplication
            }

            fullTrajectory.AddRange(segment);
        }

        return fullTrajectory;
    }
}
