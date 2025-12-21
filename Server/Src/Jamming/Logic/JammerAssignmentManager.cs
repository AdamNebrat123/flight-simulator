public class JammerAssignmentManager
{
    private static JammerAssignmentManager _instance = new JammerAssignmentManager();
    private readonly JammerManager _jammerManager = JammerManager.GetInstance();
    private readonly ZoneManager _zoneManager = ZoneManager.GetInstance();
    private JammerAssignmentManager()
    {
        
    }

    public static JammerAssignmentManager GetInstance()
    {
        return _instance;
    }
    
    public async Task AssignJammers(ScenarioAirCraftsSnapshot snapshot)
    {
        List<JamZoneContext> jamZoneContexts = BuildJamZoneContexts(snapshot);
        JammersSnapshot previous = _jammerManager.CreateSnapshot();
        UpdateJammers(jamZoneContexts);

        List<Jammer> changedJammers = GetChangedJammers(previous, _jammerManager.CreateSnapshot());
        if (changedJammers == null || changedJammers.Count == 0)
            return;

        string msg = WebSocketServer.prepareMessageToClient(
            S2CMessageType.JammersUpdate,
            changedJammers,
            ModeEnum.ScenarioSimulator
        );

        // send only changed jammers
        WebSocketServer.SendMsgToClients(msg, ModeEnum.ScenarioSimulator);
    }

    public void UpdateJammers(IEnumerable<JamZoneContext> zones)
    {
        foreach (JamZoneContext zone in zones)
        {
            HandleAssignmentForZone(zone);
        }
    }


    private void HandleAssignmentForZone(JamZoneContext zone)
    {
        try
        {
            List<Jammer> jammers = zone.Jammers;
            List<DroneCoverageContext> drones = zone.Drones;

            // reset state
            foreach (Jammer jammer in jammers)
                jammer.StopJamming();

            foreach (var drone in drones)
                drone.CoveredBy = CoveredBy.None;

            // build coverage map. JammerId -> List of drones in its range
            JammerCoverageMap coverageMap = JammerCoverageBuilder.Build(jammers, drones);

            // omni phase
            // OmniCandidate - a jammer with its potential drones to cover
            // sorted by most drones covered!
            List<OmniCandidate> omniCandidates = OmniCandidateBuilder.BuildCandidates(jammers, coverageMap);

            // assign omni jammers. 
            OmniAssignmentProcessor.AssignOmniJammers(omniCandidates);

            // directional phase
            DirectionalAssignmentProcessor.AssignDirectionalJammers(drones, jammers);
        }
        catch (Exception ex)
        {
            System.Console.WriteLine("Error in JammerAssignmentManager.HandleAssignmentForZone: " + ex.Message);
        }
    }


    public List<JamZoneContext> BuildJamZoneContexts(ScenarioAirCraftsSnapshot snapshot)
    {
        try
        {
            var zonesDict = new Dictionary<string, List<DroneCoverageContext>>();
            ZoneChecker zoneChecker = new();

            
            foreach (AircraftStatus aircraftStatus in snapshot.aircrafts)
            {
                if(aircraftStatus.aircraftType != AircraftTypeEnum.Drone.ToString())
                    continue;

                DroneStatus droneStatus = (DroneStatus)aircraftStatus;

                TrajectoryPoint trajectoryPoint = droneStatus.trajectoryPoints.FirstOrDefault();
                if (trajectoryPoint == null)
                    continue;

                List<JamZone>? jamZonesIn = zoneChecker.GetJamZonesContainingPoint(trajectoryPoint.position);
                if (jamZonesIn == null || jamZonesIn.Count == 0)
                    continue;


                foreach (JamZone jamZone in jamZonesIn)
                {
                    if (!zonesDict.TryGetValue(jamZone.zoneId, out var droneList))
                    {
                        droneList = new List<DroneCoverageContext>();
                        zonesDict[jamZone.zoneId] = droneList;
                    }

                    droneList.Add(new DroneCoverageContext(droneStatus));
                }
            }

            // Now build JamZoneContexts

            List<JamZoneContext> jamZoneContexts = new List<JamZoneContext>();

            foreach (var kvp in zonesDict)
            {
                string zoneId = kvp.Key;
                List<DroneCoverageContext> drones = kvp.Value;

                Zone zone = _zoneManager.TryGetZone(zoneId);
                if(zone == null || zone.zoneType != ZoneType.Jam.ToString())
                    continue;
                
                JamZone jamZone = (JamZone)zone;
                List<string> jammersIds = jamZone.jammersIds;
                List<Jammer> jammers = _jammerManager.GetJammersByIds(jammersIds);

                if (jammers.Count == 0)
                    continue;

                jamZoneContexts.Add(new JamZoneContext(zoneId, jammers, drones));
            }
            return jamZoneContexts;
        }

        catch (Exception ex)
        {
            System.Console.WriteLine("Error in JammerAssignmentManager.BuildJamZoneContexts: " + ex.Message);
            return new List<JamZoneContext>();
        }
    }
    public List<Jammer> GetChangedJammers(JammersSnapshot previous, JammersSnapshot current)
    {
        List<Jammer> changed = new();

        foreach (var kvp in current.States)
        {
            string id = kvp.Key;
            JammerStateSnapshot curr = kvp.Value;

            if (!previous.States.TryGetValue(id, out var prev))
            {
                Jammer? jammer = _jammerManager.GetJammerById(id);
                if (jammer == null)
                    changed.Add(jammer);
                continue;
            }

            if (curr.JamMode != prev.JamMode)
            {
                Jammer? jammer = _jammerManager.GetJammerById(id);
                if (jammer == null)
                    changed.Add(jammer);
                continue;
            }

            if (curr.JamMode == JamMode.Directional &&
                curr.DirectionDegrees != prev.DirectionDegrees)
            {
                Jammer? jammer = _jammerManager.GetJammerById(id);
                if (jammer == null)
                    changed.Add(jammer);
                continue;
            }
        }

        return changed;
    }

}