public class TrajectoryManager
{
    // Each inner list is a snapshot in time: one point from each plane
    public List<List<TrajectoryPoint>> CalculatedTrajectoryPoints { get; } = new();

    // Keeps track of all trajectories
    private readonly List<List<TrajectoryPoint>> _allTrajectories = new();

    public void AddTrajectory(List<TrajectoryPoint> newTrajectory)
    {
        _allTrajectories.Add(newTrajectory);

        // Ensure CalculatedTrajectoryPoints has enough time steps
        for (int i = 0; i < newTrajectory.Count; i++)
        {
            if (CalculatedTrajectoryPoints.Count <= i)
            {
                CalculatedTrajectoryPoints.Add(new List<TrajectoryPoint>());
            }

            CalculatedTrajectoryPoints[i].Add(newTrajectory[i]);
        }

        // If this new trajectory is shorter than existing steps, it will simply skip them
        // No need to pad with nulls unless you want to
    }
}
