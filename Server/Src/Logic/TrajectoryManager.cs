public class TemporaryCalculatedPointsStorage
{
    // Each element in the list is a result at a certain time with all planes
    public List<ScenarioAirCraftsSnapshot> CalculatedTrajectoryPoints { get; } = new();

    // Saving routes for each plane separately
    private readonly List<List<TrajectoryPoint>> _allTrajectories = new();
    private readonly List<string> _planeNames = new();

    public void AddTrajectory(List<TrajectoryPoint> newTrajectory, AircraftTrajectory aircraft)
    {
        _allTrajectories.Add(newTrajectory);
        _planeNames.Add(aircraft.aircraftName);

        for (int i = 0; i < newTrajectory.Count; i++)
        {
            if (CalculatedTrajectoryPoints.Count <= i)
            {
                CalculatedTrajectoryPoints.Add(new ScenarioAirCraftsSnapshot(new List<AircraftStatus>()));
            }

            var point = newTrajectory[i];
            var wrapped = aircraft.CreateStatus(point);

            CalculatedTrajectoryPoints[i].planes.Add(wrapped);
        }
    }
}