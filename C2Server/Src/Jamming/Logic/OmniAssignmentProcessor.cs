public static class OmniAssignmentProcessor
{
    public static void AssignOmniJammers(List<OmniCandidate> candidates)
    {
        foreach (var candidate in candidates)
        {
            var jammer = candidate.Jammer;
            var drones = candidate.DronesInRange;

            if (jammer.status != Status.Online)
                return;

            // how many uncovered drones are in range
            var uncoveredDrones = drones
                .Where(d => d.CoveredBy != CoveredBy.Omnidirectional)
                .ToList();

            if (uncoveredDrones.Count < 2)
                continue;

            // assign jammer to omnidirectional mode
            jammer.StartOmnidirectionalJamming();

            foreach (var droneCtx in uncoveredDrones)
            {
                droneCtx.CoveredBy = CoveredBy.Omnidirectional;
            }
        }
    }
}
