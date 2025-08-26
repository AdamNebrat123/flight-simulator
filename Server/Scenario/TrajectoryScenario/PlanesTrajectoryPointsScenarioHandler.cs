using System.Text.Json;

public class PlanesTrajectoryPointsScenarioHandler
{
    private readonly TrajectoryScenarioResultsManager trajectoryScenarioResultsManager = TrajectoryScenarioResultsManager.GetInstance();
    private readonly ScenariosDataManager scenariosDataManager = ScenariosDataManager.GetInstance();
    private const double timeStepSeconds = 0.1;

    private static PlanesTrajectoryPointsScenarioHandler _instance;

    private PlanesTrajectoryPointsScenarioHandler()
    {
    }

    public static PlanesTrajectoryPointsScenarioHandler GetInstance()
    {
        if (_instance == null)
            _instance = new PlanesTrajectoryPointsScenarioHandler();
        return _instance;
    }

    public void HandlePlanesTrajectoryPointsScenario(JsonElement data)
    {
        PlanesTrajectoryPointsScenario planesTrajectoryPointsEvent = data.Deserialize<PlanesTrajectoryPointsScenario>();
        // save in the file
        scenariosDataManager.AddScenario(planesTrajectoryPointsEvent);
        CalculateScenarioReuslts(planesTrajectoryPointsEvent);
    }
    public void CalculateScenarioReuslts(PlanesTrajectoryPointsScenario planesTrajectoryPointsEvent)
    {
        TrajectoryManager trajectoryManager = new TrajectoryManager();
        List<PlaneTrajectoryPoints> planesTrajectoryPoints = planesTrajectoryPointsEvent.planes;

        foreach (PlaneTrajectoryPoints plane in planesTrajectoryPoints)
        {
            foreach (GeoPoint point in plane.geoPoints)
            {
                System.Console.WriteLine(point);
            }
            List<TrajectoryPoint> trajectory = HandleSinglePlane(plane);
            trajectoryManager.AddTrajectory(trajectory, plane.planeName);
        }

        ScenarioResults scenarioResult = new ScenarioResults
        {
            scenarioName = planesTrajectoryPointsEvent.scenarioName,
            points = trajectoryManager.CalculatedTrajectoryPoints,
            isPaused = false,
            playSpeed = 1.0
        };

        // Store the scenario
        bool isAdded = trajectoryScenarioResultsManager.TryAddScenario(planesTrajectoryPointsEvent.scenarioName, scenarioResult);
        if (isAdded)
            System.Console.WriteLine("Successfully saved scenario: " + planesTrajectoryPointsEvent.scenarioName);
        else
            System.Console.WriteLine(planesTrajectoryPointsEvent.scenarioName + " already exists.");
    }

    private List<TrajectoryPoint> HandleSinglePlane(PlaneTrajectoryPoints plane)
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
