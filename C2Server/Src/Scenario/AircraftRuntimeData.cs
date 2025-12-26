public class AircraftRuntimeData
{
    public string AircraftId { get; init; }
    public AircraftTrajectory Aircraft { get; init; }
    public Queue<TrajectoryPoint> Trajectory { get; set; }
}