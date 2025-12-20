public class AircraftRuntimeData
{
    public string AircraftId { get; init; }
    public AircraftTrajectory Aircraft { get; set; }
    public Queue<TrajectoryPoint> Trajectory { get; init; }
}