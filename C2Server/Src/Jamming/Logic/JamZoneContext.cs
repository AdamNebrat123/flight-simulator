public class JamZoneContext
{
    public string ZoneId { get; }

    public List<Jammer> Jammers { get; }
    public List<DroneCoverageContext> Drones { get; }

    public JamZoneContext(
        string zoneId,
        List<Jammer> jammers,
        List<DroneCoverageContext> drones)
    {
        ZoneId = zoneId;
        Jammers = jammers;
        Drones = drones;
    }
}
