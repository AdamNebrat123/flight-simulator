public static class JammerCoverageBuilder
{
    public static JammerCoverageMap Build(IEnumerable<Jammer> jammers, IEnumerable<DroneCoverageContext> drones)
    {
        try
        {
            if(jammers.Any() == false || drones.Any() == false)
                return new JammerCoverageMap();
                
            JammerCoverageMap map = new JammerCoverageMap();

            foreach (Jammer jammer in jammers)
            {
                if (jammer.status != Status.Online)
                    continue;

                foreach (DroneCoverageContext droneCtx in drones)
                {
                    DroneStatus drone = droneCtx.Drone;

                    if (!jammer.HasJamFrequency(drone.frequency))
                        continue;

                    if (!jammer.IsInJammerRange(drone.trajectoryPoints.First().position))
                        continue;

                    map.Add(jammer.id, droneCtx);
                }
            }

            return map;
        }

        catch (Exception ex)
        {
            System.Console.WriteLine("Error in JammerCoverageBuilder: " + ex.Message);
            return new JammerCoverageMap();
        }
    }
}
