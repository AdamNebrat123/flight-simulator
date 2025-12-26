public static class OmniCandidateBuilder
{
    public static List<OmniCandidate> BuildCandidates(IEnumerable<Jammer> jammers, JammerCoverageMap coverageMap)
    {
        try
        {
            var candidates = new List<OmniCandidate>();

            foreach (Jammer jammer in jammers)
            {
                if (jammer.status != Status.Online)
                    continue;

                if (!coverageMap.Map.TryGetValue(jammer.id, out List<DroneCoverageContext>? dronesInRange))
                    continue;

                if (dronesInRange.Count < 2)
                    continue;

                candidates.Add(new OmniCandidate(jammer, dronesInRange));
            }

            return candidates
                .OrderByDescending(c => c.DronesInRange.Count)
                .ToList();
        }    
        catch (Exception ex)
        {
            System.Console.WriteLine("Error in OmniCandidateBuilder: " + ex.Message);
            return new List<OmniCandidate>();
        }
    }
}
