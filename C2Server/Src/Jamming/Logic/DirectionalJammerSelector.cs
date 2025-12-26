public static class DirectionalJammerSelector
{
    public static Jammer? FindClosestAvailableJammer(IEnumerable<Jammer> jammers, DroneCoverageContext droneCtx)
    {
        var drone = droneCtx.Drone;
        var dronePosition = drone.trajectoryPoints.First().position;

        return jammers
            .Where(j =>
                j.status == Status.Online &&
                j.jamMode == JamMode.None && // NONE ONLY
                j.HasJamFrequency(drone.frequency) &&
                j.IsInJammerRange(dronePosition))
            .OrderBy(j => j.GetDistance(dronePosition))
            .FirstOrDefault();
    }
}
