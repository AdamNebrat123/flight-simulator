using System.Text.Json;

public class ScenarioResultsCalculator
{
    private const double timeStepSeconds = 0.1;

    private static ScenarioResultsCalculator _instance;

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
        if (scenario == null || scenario.planes == null)
        {
            // Return a default ScenarioResults or throw an exception
            return null;
        }

        TemporaryCalculatedPointsStorage temporaryCalculatedPointsStorage = new TemporaryCalculatedPointsStorage();
        List<AerialUnitTrajectoryPoints> planesTrajectoryPoints = scenario.planes;

        foreach (AerialUnitTrajectoryPoints plane in planesTrajectoryPoints)
        {
            List<TrajectoryPoint> trajectory = HandleSinglePlane(plane);
            temporaryCalculatedPointsStorage.AddTrajectory(trajectory, plane.planeName);
        }

        ScenarioResults scenarioResult = new ScenarioResults
        {
            scenarioId = scenario.scenarioId,
            scenarioName = scenario.scenarioName,
            points = temporaryCalculatedPointsStorage.CalculatedTrajectoryPoints,
            isPaused = false,
            playSpeed = 1.0
        };

        return scenarioResult;
    }

    private List<TrajectoryPoint> HandleSinglePlane(AerialUnitTrajectoryPoints plane)
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
