public class JammerStateSnapshot
{
    public string JammerId { get; }
    public JamMode JamMode { get; }
    public double? DirectionDegrees { get; }

    public JammerStateSnapshot(Jammer jammer)
    {
        JammerId = jammer.id;
        JamMode = jammer.jamMode;
        DirectionDegrees = jammer.jamMode == JamMode.Directional
            ? jammer.DirectionDegrees
            : null;
    }
}