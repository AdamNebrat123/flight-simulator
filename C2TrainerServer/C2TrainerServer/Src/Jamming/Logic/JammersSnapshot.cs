public class JammersSnapshot
{
    public Dictionary<string, JammerStateSnapshot> States { get; }

    public JammersSnapshot(Dictionary<string, Jammer> jammers)
    {
        States = jammers.Values.ToDictionary(
            jammer => jammer.id,
            jammer => new JammerStateSnapshot(jammer)
        );
    }
}
