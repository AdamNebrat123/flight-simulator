public class TrajectoryPoint
{
    public GeoPoint Position { get; set; }
    public double Heading { get; set; }
    public double Pitch { get; set; }

    public TrajectoryPoint(GeoPoint position, double heading, double pitch)
    {
        Position = position;
        Heading = heading;
        Pitch = pitch;
    }

    public override string ToString()
    {
        return string.Format("[{0},Heading={1},Pitch={2}]", Position, Heading, Pitch);
    }
}
