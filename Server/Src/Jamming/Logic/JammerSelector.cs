public static class JammerSelector
{
    public static Jammer? FindClosestMatchingJammer(IEnumerable<Jammer> jammers, DroneStatus drone)
    {
        return jammers
            .Where(j =>
                j.status == Status.Online &&
                j.HasJamFrequency(drone.frequency) &&
                j.IsInJammerRange(drone.trajectoryPoints.FirstOrDefault().position))
            .OrderBy(j =>
                j.GetDistance(drone.trajectoryPoints.FirstOrDefault().position))
            .FirstOrDefault();
    }

    public static bool IsDroneCoveredByOmni(IEnumerable<Jammer> omniJammers, DroneStatus drone)
    {
        return omniJammers.Any(j =>
            j.status == Status.Online &&
            j.HasJamFrequency(drone.frequency) &&
            j.IsInJammerRange(drone.trajectoryPoints.FirstOrDefault().position));
    }
}
