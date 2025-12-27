public enum CoveredBy
{
    None,
    Directional,
    Omnidirectional
}

public class DroneCoverageContext
{
    public DroneStatus Drone { get; }
    public CoveredBy CoveredBy { get; set; }

    public DroneCoverageContext(DroneStatus drone)
    {
        this.Drone = drone;
        CoveredBy = CoveredBy.None;
    }
}