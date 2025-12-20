public static class JammerJamModeTransitions
{
    public static void PromoteDirectionalToOmni(Jammer jammer, List<Jammer> directional, List<Jammer> omni)
    {
        directional.Remove(jammer);
        jammer.StartOmnidirectionalJamming();
        omni.Add(jammer);
    }

    public static void PromoteNoneToDirectional(Jammer jammer, DroneStatus drone, List<Jammer> none, List<Jammer> directional)
    {
        none.Remove(jammer);
        jammer.StartDirectionalJamming(
        CalculateDirection(jammer, drone));
        directional.Add(jammer);
    }

    private static double CalculateDirection(Jammer jammer, DroneStatus drone)
    {
        // TODO: Implement direction calculation logic
        return 0;
    }
}
