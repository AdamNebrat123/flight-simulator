public class TrajectoryPoint
{
    public PlaneTrajectoryPoint PlaneTrajectoryPoint { get; set; }
    public double Heading { get; set; }
    public double Pitch { get; set; }

    public TrajectoryPoint(PlaneTrajectoryPoint planeTrajectoryPoint, double heading, double pitch)
    {
        PlaneTrajectoryPoint = planeTrajectoryPoint;
        Heading = heading;
        Pitch = pitch;
    }

    public override string ToString()
    {
        return string.Format("[{0},Heading={1},Pitch={2}]", PlaneTrajectoryPoint, Heading, Pitch);
    }
}
