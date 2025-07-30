public class TrajectoryManager
{
    // Each inner list is a snapshot in time: one point from each plane
    public List<List<PlaneCalculatedTrajectoryPoints>> CalculatedTrajectoryPoints { get; } = new();

    // Keeps track of all trajectories (each plane has a list of points)
    private readonly List<List<TrajectoryPoint>> _allTrajectories = new();
    private readonly List<string> _planeNames = new();

    public void AddTrajectory(List<TrajectoryPoint> newTrajectory, string planeName)
    {
        _allTrajectories.Add(newTrajectory);
        _planeNames.Add(planeName);

        for (int i = 0; i < newTrajectory.Count; i++)
        {
            if (CalculatedTrajectoryPoints.Count <= i)
            {
                CalculatedTrajectoryPoints.Add(new List<PlaneCalculatedTrajectoryPoints>());
            }

            var point = newTrajectory[i];
            var wrapped = new PlaneCalculatedTrajectoryPoints
            {
                planeName = planeName,
                trajectoryPoints = new List<TrajectoryPoint> { point }
            };

            CalculatedTrajectoryPoints[i].Add(wrapped);
        }

    }
}
