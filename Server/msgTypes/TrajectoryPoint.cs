public class TrajectoryPoint
{
    public GeoPoint position { get; set; }
    public double heading { get; set; }
    public double pitch { get; set; }

    public TrajectoryPoint(GeoPoint position, double heading, double pitch)
    {
        this.position = position;
        this.heading = heading;
        this.pitch = pitch;
    }

    public override string ToString()
    {
        return string.Format("[{0},Heading={1},Pitch={2}]", position, heading, pitch);
    }
}
