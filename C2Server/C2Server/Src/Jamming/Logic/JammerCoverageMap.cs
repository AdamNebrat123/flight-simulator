public class JammerCoverageMap
{
    // JammerId -> List of drones in its range
    public Dictionary<string, List<DroneCoverageContext>> Map { get; } = new();

    public JammerCoverageMap()
    {
        
    }
    public void Add(string jammerId, DroneCoverageContext drone)
    {
        if (!Map.TryGetValue(jammerId, out var list))
        {
            list = new List<DroneCoverageContext>();
            Map[jammerId] = list;
        }

        list.Add(drone);
    }
    public void SetDroneCovergeToNone()
    {
        foreach (var drones in Map.Values)
        {
            foreach(var drone in drones)
            {
                drone.CoveredBy = CoveredBy.None;
            }
        }
    }
}
