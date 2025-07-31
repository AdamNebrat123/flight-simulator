public class PlaneTrajectoryPoints
{
    public string planeName { get; set; }
    public double velocity { get; set; }
    public List<GeoPoint> geoPoints { get; set; }

    public override string ToString()
    {
        return $"PlaneName: {planeName}, Velocity: {velocity}, GeoPoints Count: {geoPoints?.Count ?? 0}";
    }
}