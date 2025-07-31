public class MultiPlaneTrajectoryResult
{
    public List<PlaneCalculatedTrajectoryPoints> planes { get; set; }

    public MultiPlaneTrajectoryResult

(List<PlaneCalculatedTrajectoryPoints> planes)
    {
        this.planes = planes;
    }
}
