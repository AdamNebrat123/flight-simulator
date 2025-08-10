using System.Text.Json;

public class PlanesTrajectoryPointsScenarioHandler
{
    private readonly TrajectoryScenarioResultsManager trajectoryScenarioResultsManager;
    private const double timeStepSeconds = 0.1;
    public PlanesTrajectoryPointsScenarioHandler(TrajectoryScenarioResultsManager trajectoryScenarioResultsManager)
    {
        this.trajectoryScenarioResultsManager = trajectoryScenarioResultsManager;
    }
    public void HandlePlanesTrajectoryPointsScenario(JsonElement data)
    {
        handleTrajectoryPointsEvent(data);
        
        //_ = SendCalculatedTrajectoryPointsAsync(allCalculatedTrajectoryPoints);
    }
    private void handleTrajectoryPointsEvent(JsonElement data)
    {
        TrajectoryManager trajectoryManager = new TrajectoryManager();
        PlanesTrajectoryPointsScenario planesTrajectoryPointsEvent = data.Deserialize<PlanesTrajectoryPointsScenario>();
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
        // Store the scenarion
        trajectoryScenarioResultsManager.AddResults(
            planesTrajectoryPointsEvent.scenarioName,
            trajectoryManager.CalculatedTrajectoryPoints);
            
        System.Console.WriteLine("Successfully saved scenario: " + planesTrajectoryPointsEvent.scenarioName);
    }

    private List<TrajectoryPoint> HandleSinglePlane(PlaneTrajectoryPoints plane)
    {
        List<TrajectoryPoint> fullTrajectory = new List<TrajectoryPoint>();

        for (int i = 0; i < plane.geoPoints.Count - 1; i++)
        {
            GeoPoint start = plane.geoPoints[i];
            GeoPoint end = plane.geoPoints[i + 1];

            TrajectoryCalculator calculator = new TrajectoryCalculator();
            List<TrajectoryPoint> segment = calculator.ComputeTrajectory(start, end, plane.velocity, timeStepSeconds); //timeStepSeconds is a const

            if (i > 0 && segment.Count > 0)
            {
                segment.RemoveAt(0); // Avoid duplication
            }

            fullTrajectory.AddRange(segment);
        }

        return fullTrajectory;
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