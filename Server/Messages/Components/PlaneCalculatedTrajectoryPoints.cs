public class PlaneCalculatedTrajectoryPoints
{
    public string planeName { get; set; }
    public List<TrajectoryPoint> trajectoryPoints { get; set; }
    public PlaneCalculatedTrajectoryPoints()
    {

    }
    public PlaneCalculatedTrajectoryPoints(string planeName, List<TrajectoryPoint> trajectoryPoints)
    {
        this.planeName = planeName;
        this.trajectoryPoints = trajectoryPoints;
    }
    public override string ToString()
{
    return $"PlaneName: {planeName}, TrajectoryPoints Count: {trajectoryPoints?.Count ?? 0}";
}
}
