public static class DirectionalAssignmentProcessor
{
    public static void AssignDirectionalJammers(IEnumerable<DroneCoverageContext> drones, IEnumerable<Jammer> jammers)
    {
        foreach (DroneCoverageContext droneCtx in drones)
        {
            // if already covered by omni, continue
            if (droneCtx.CoveredBy == CoveredBy.Omnidirectional)
                continue;

            var jammer = DirectionalJammerSelector.FindClosestAvailableJammer(jammers, droneCtx);

            if (jammer == null)
                continue;

            // Now assign jammer to directional mode
            jammer.StartDirectionalJamming(CalculateDirection(jammer, droneCtx.Drone));

            droneCtx.CoveredBy = CoveredBy.Directional;
        }
    }

    private static double CalculateDirection(Jammer jammer, DroneStatus drone)
    {
        // TODO: azimuth calculation logic here
        return 0;
    }
}
