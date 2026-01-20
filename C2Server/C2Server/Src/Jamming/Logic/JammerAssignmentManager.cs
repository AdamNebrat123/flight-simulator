public class JammerAssignmentManager
{
    private static JammerAssignmentManager _instance = new JammerAssignmentManager();
    private readonly JammerManager _jammerManager = JammerManager.GetInstance();
    private readonly ZoneManager _zoneManager = ZoneManager.GetInstance();
    private DroneFallManager _droneFallManager = null;
    private JammerAssignmentManager()
    {
        
    }

    public static JammerAssignmentManager GetInstance()
    {
        return _instance;
    }
    /*
    public void SetScenarioResults(ScenarioResults scenarioResults, ScenarioResults scenarioResultsCopy)
    {
        _scenarioResults = scenarioResults;
        _scenarioResultsCopy = scenarioResultsCopy;
        _droneFallManager = new DroneFallManager(_scenarioResults, _scenarioResultsCopy);
    }
    public ScenarioResults GetScenarioResults()
    {
        return _scenarioResults;
    }
    */
    
    public async Task AssignJammers(ScenarioAirCraftsSnapshot snapshot)
    {
        List<JamZoneContext> jamZoneContexts = BuildJamZoneContexts(snapshot);
        //JammersSnapshot previous = _jammerManager.CreateSnapshot();

        foreach(var jammer in _jammerManager.GetAllJammers())
        {
            jammer.jamMode = JamMode.None;
        }
        UpdateJammers(jamZoneContexts.ToList());

        //List<Jammer> changedJammers = GetChangedJammers(previous, _jammerManager.CreateSnapshot());
        //if (changedJammers == null || changedJammers.Count == 0)
        //    return;
        
        
        JammersUpdate jammersUpdate= new JammersUpdate
        {
            jammers = _jammerManager.GetAllJammers(),
        };
        string msg = UIWebSocketServer.PrepareMessageToClient(
            S2CMessageType.JammersUpdate,
            jammersUpdate
        );

        UIWebSocketServer.SendMsgToClients(msg);
    }

    public void UpdateJammers(List<JamZoneContext> zones)
    {
        List<JammerCoverageMap> jammerCoverageMaps= new List<JammerCoverageMap>();
        foreach (JamZoneContext zone in zones)
        {
            List<Jammer> jammers = zone.Jammers;
            List<DroneCoverageContext> drones = zone.Drones;
            if(jammers == null || drones == null || jammers.Count == 0 || drones.Count == 0)
                return;
            
            
            // build coverage map. JammerId -> List of drones in its range
            JammerCoverageMap coverageMap = JammerCoverageBuilder.Build(jammers, drones);
            coverageMap.SetDroneCovergeToNone();
            jammerCoverageMaps.Add(coverageMap);
        }
        if(jammerCoverageMaps.Count == 0)
            return;

        for(int i = 0; i < jammerCoverageMaps.Count; i++)
        {
            HandleAssignmentForZone(jammerCoverageMaps[i], zones[i].Jammers, zones[i].Drones);
        }

    }


    private void HandleAssignmentForZone(JammerCoverageMap coverageMap, List<Jammer> jammers,  List<DroneCoverageContext> drones)
    {
        try
        {


            // omni phase
            // OmniCandidate - a jammer with its potenstial drones to cover
            // sorted by most drones covered!
            List<OmniCandidate> omniCandidates = OmniCandidateBuilder.BuildCandidates(jammers, coverageMap);

            // assign omni jammers. 
            if (omniCandidates != null || omniCandidates.Count > 0)
                OmniAssignmentProcessor.AssignOmniJammers(omniCandidates);

            // directional phase
            DirectionalAssignmentProcessor.AssignDirectionalJammers(drones, jammers);

            // UpdateDroneCoverage
            // To check if drone needs to fall.
            foreach(DroneCoverageContext drone in drones)
            {
                bool isCovered = drone.CoveredBy != CoveredBy.None;
                /////////////////////////////////////////_droneFallManager.UpdateDroneCoverage(drone.Drone.aircraftId, isCovered);
            }
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
            JammerStateSnapshot prev;
            previous.States.TryGetValue(id, out prev);

            if(prev == null)
            {
                Jammer? jammer = _jammerManager.GetJammerById(id);
                changed.Add(jammer);
                continue;
            }

            if (curr.JamMode != prev.JamMode)
            {
                Jammer? jammer = _jammerManager.GetJammerById(id);
                if (jammer != null){
                    changed.Add(jammer);
                    System.Console.WriteLine("ADDED JAMMERRRRRRRRRRRRRRRRRR");
                    System.Console.WriteLine(prev.JamMode + " --> " + curr.JamMode);
                }
                continue;
            }

            if (curr.JamMode == JamMode.Directional && prev.JamMode == JamMode.Directional &&
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