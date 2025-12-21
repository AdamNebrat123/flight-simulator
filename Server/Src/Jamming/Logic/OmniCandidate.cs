public class OmniCandidate
{
    public Jammer Jammer { get; }
    public List<DroneCoverageContext> DronesInRange { get; }

    public OmniCandidate(Jammer jammer, List<DroneCoverageContext> dronesInRange)
    {
        Jammer = jammer;
        DronesInRange = dronesInRange;
    }
}
