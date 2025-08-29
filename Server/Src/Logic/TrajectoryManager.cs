public class TemporaryCalculatedPointsStorage
{
    // Each element in the list is a result at a certain time with all planes
    public List<ScenarioPlanesSnapshot> CalculatedTrajectoryPoints { get; } = new();

    // Saving routes for each plane separately
    private readonly List<List<TrajectoryPoint>> _allTrajectories = new();
    private readonly List<string> _planeNames = new();

    public void AddTrajectory(List<TrajectoryPoint> newTrajectory, string planeName)
    {
        _allTrajectories.Add(newTrajectory);
        _planeNames.Add(planeName);

        for (int i = 0; i < newTrajectory.Count; i++)
        {
            // If there is no snapshot for this point in time yet - create a new one
            if (CalculatedTrajectoryPoints.Count <= i)
            {
                CalculatedTrajectoryPoints.Add(new ScenarioPlanesSnapshot(new List<PlaneCalculatedTrajectoryPoints>()));
            }

            var point = newTrajectory[i];
            var wrapped = new PlaneCalculatedTrajectoryPoints
            {
                planeName = planeName,
                trajectoryPoints = new List<TrajectoryPoint> { point }
            };

            CalculatedTrajectoryPoints[i].planes.Add(wrapped);
        }
    }
}