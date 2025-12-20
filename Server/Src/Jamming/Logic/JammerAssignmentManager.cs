public class JammerAssignmentManager
{
    private static JammerAssignmentManager _instance = new JammerAssignmentManager();
    private readonly JammerManager _jammerManager = JammerManager.GetInstance();
    private readonly ScenarioResultsManager _trajectoryScenarioResultsManager = ScenarioResultsManager.GetInstance();

    private readonly ZoneManager _zoneManager = ZoneManager.GetInstance();
    private JammerAssignmentManager()
    {
        
    }

    public static JammerAssignmentManager GetInstance()
    {
        return _instance;
    }

    public void UpdateJammers(List<DronesInJamZone> dronesInJamZones)
    {
        foreach (DronesInJamZone zone in dronesInJamZones)
        {
            HandleAssignmentForZone(zone);
        }
    }


    private void HandleAssignmentForZone(DronesInJamZone zone)
    {
        Zone zone1 = _zoneManager.TryGetZone(zone.ZoneId);
        if(zone1 == null || zone1.zoneType != ZoneType.Jam.ToString())
            return;
        
        JamZone jamZone = (JamZone)zone1;

        if(jamZone.jammersIds == null || jamZone.jammersIds.Count == 0)
            return;
        

        List<Jammer> noneJammers = new();
        List<Jammer> directionalJammers = new();
        List<Jammer> omniJammers = new();

        foreach(string zoneId in jamZone.jammersIds)
        {
            Jammer? jammer = _jammerManager.GetJammerById(zoneId);
            if(jammer == null || jammer.status != Status.Online)
                continue;

            if(jammer.jamMode == JamMode.Directional)
                directionalJammers.Add(jammer);

            else if (jammer.jamMode == JamMode.Omnidirectional)
                omniJammers.Add(jammer);

            else
                noneJammers.Add(jammer);
        }
        /*
        List<DroneTrajectory> dronesInZone = new();
        foreach(string droneId in zone.DroneIds)
        {
            DroneTrajectory? drone = _trajectoryScenarioResultsManager.TryGetDrone(droneId);
            if(drone != null)
                dronesInZone.Add(drone);
        }
        */

        
    }


    private void HandleDroneInZone(DroneStatus drone, JamZone jamZone, List<Jammer> noneJammers, List<Jammer> directionalJammers, List<Jammer> omniJammers)
    {
        // Omnidirectional - if is already covered by omni, do nothing
        if (JammerSelector.IsDroneCoveredByOmni(omniJammers, drone))
            return;


        // There is no omni coverage - try to promote jammers
        // Directional - promote closest directional to omni
        if (directionalJammers.Count > 0)
        {
            var closestDirectional =
                JammerSelector.FindClosestMatchingJammer(
                    directionalJammers, drone);

            if (closestDirectional != null)
            {
                JammerJamModeTransitions.PromoteDirectionalToOmni(closestDirectional, directionalJammers, omniJammers);
                return;
            }
        }

        // There is no directional coverage
        // None - promote closest none to directional
        if (noneJammers.Count > 0)
        {
            var closestIdle =
                JammerSelector.FindClosestMatchingJammer(noneJammers, drone);

            if (closestIdle != null)
            {
                JammerJamModeTransitions.PromoteNoneToDirectional(closestIdle, drone, noneJammers, directionalJammers);
            }
        }
    }
}