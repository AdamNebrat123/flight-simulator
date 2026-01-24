using System.Text.Json;

public class ScenarioHandler
{
    private static ScenarioHandler instance;
    private readonly ScenarioManager scenarioManager = ScenarioManager.GetInstance();
    private readonly ScenariosDataManager scenariosDataManager = ScenariosDataManager.GetInstance();
    private readonly ScenarioResultsManager scenarioResultsManager = ScenarioResultsManager.GetInstance();
    private readonly ScenarioResultsCalculator scenarioResultsCalculator = ScenarioResultsCalculator.GetInstance();

    private readonly ZoneChecker zoneChecker = new();

    private ScenarioHandler()
    {
    }

    public static ScenarioHandler GetInstance()
    {
        if (instance == null)
        {
            instance = new ScenarioHandler();
        }
        return instance;
    }

    public void HandleAddScenario(JsonElement data, ModeEnum clientMode)
    {
        try
        {
            Scenario scenario = data.Deserialize<Scenario>();

            // create a new unique ID for the scenario
            Guid uuid = Guid.NewGuid();
            string uuidString = uuid.ToString();
            scenario.scenarioId = uuidString;

            // create a new unique ID for every plane
            foreach (AircraftTrajectory aircraft in scenario.aircrafts)
            {
                Guid aircraftId = Guid.NewGuid();
                string aircraftIdString = aircraftId.ToString();
                aircraft.aircraftId = aircraftIdString;
            }
            foreach(Sensor jammer in scenario.jammers)
            {
                Guid id = Guid.NewGuid();
                string idString = id.ToString();
                jammer.id = idString;
            }
            foreach(Sensor radar in scenario.radars)
            {
                Guid id = Guid.NewGuid();
                string idString = id.ToString();
                radar.id = idString;
            }
            foreach(Zone zone in scenario.zones)
            {
                Guid id = Guid.NewGuid();
                string idString = id.ToString();
                zone.zoneId = idString;
            }

            
            ScenarioResults? scenarioResults = scenarioResultsCalculator.CalculateScenarioResults(scenario);
            AddJammersIdsToJamZones(scenario.jammers, scenario.zones);

            // add in file
            scenariosDataManager.AddAndSaveScenario(scenario);


            // add in a map 
            bool isAdded = scenarioManager.TryAddScenario(scenario);
            if (isAdded)
            {
                System.Console.WriteLine("{0} ({1}) - Added scenario successfully.", scenario.scenarioId, scenario.scenarioName);
                SendAddScenario(scenario, clientMode);


                // calculate scenario results
                if (scenarioResults != null)
                {
                    // save the calculated scenario
                    scenarioResultsManager.TryAddScenario(scenario.scenarioId, scenarioResults);
                }
            }
            else
            {
                System.Console.WriteLine("{0} ({1}) - Failed to add scenario.", scenario.scenarioId, scenario.scenarioName);
                SendScenarioError($"{scenario.scenarioId} ({scenario.scenarioName}) - Failed to add scenario.", clientMode);
            }
        }
        catch (Exception ex)
        {
            System.Console.WriteLine("Error in HandleAddScenario: " + ex.Message);
        }
    }

    public void HandleRemoveScenario(JsonElement data, ModeEnum clientMode)
    {
        try
        {
            Scenario scenario = data.Deserialize<Scenario>();
            string scenarioId = scenario.scenarioId;

            bool isRemoved = scenariosDataManager.RemoveAndSaveScenario(scenarioId);
            if (isRemoved)
            {
                System.Console.WriteLine("{0} ({1}) - Removed scenario from file successfully.", scenarioId, scenario.scenarioName);
                isRemoved = scenarioManager.TryRemoveScenario(scenarioId);
                if (isRemoved)
                {
                    System.Console.WriteLine("{0} ({1}) - Removed scenario successfully.", scenarioId, scenario.scenarioName);
                    SendRemoveScenario(scenario, clientMode);
                }
                else
                {
                    System.Console.WriteLine("{0} ({1}) - Failed to remove scenario.", scenarioId, scenario.scenarioName);
                    SendScenarioError($"{scenarioId} ({scenario.scenarioName}) - Failed to remove scenario.", clientMode);
                }
            }
            else
            {
                System.Console.WriteLine("{0} ({1}) - Failed to remove scenario.", scenarioId, scenario.scenarioName);
                SendScenarioError($"{scenarioId} ({scenario.scenarioName}) - Failed to remove scenario.", clientMode);
            }
        }
        catch (Exception ex)
        {
            System.Console.WriteLine("Error in HandleRemoveScenario: " + ex.Message);
        }
    }

    public void HandleEditScenario(JsonElement data, ModeEnum clientMode)
    {
        try
        {
            Scenario scenario = data.Deserialize<Scenario>();
            string scenarioId = scenario.scenarioId;

            ScenarioResults? scenarioResults = scenarioResultsCalculator.CalculateScenarioResults(scenario);
            AddJammersIdsToJamZones(scenario.jammers, scenario.zones);

            bool isEdited = scenariosDataManager.EditAndSaveScenario(scenarioId, scenario);
            System.Console.WriteLine("{0} ({1}) - edited scenario in file successfully.", scenarioId, scenario.scenarioName);

            if (isEdited)
            {
                isEdited = scenarioManager.TryEditScenario(scenarioId, scenario);

                if (isEdited)
                {
                    System.Console.WriteLine("{0} ({1}) - Edited scenario successfully.", scenarioId, scenario.scenarioName);
                    // calculate scenario results
                    if (scenarioResults != null)
                    {
                        // save the calculated scenario
                        scenarioResultsManager.TryEditScenario(scenario.scenarioId, scenarioResults);
                        SendEditScenario(scenario, clientMode);
                    }
                }
                else
                {
                    System.Console.WriteLine("{0} ({1}) - Failed to edit scenario.", scenarioId, scenario.scenarioName);
                    SendScenarioError($"{scenarioId} ({scenario.scenarioName}) - Failed to edit scenario.", clientMode);
                }
            }
            else
            {
                System.Console.WriteLine("{0} ({1}) - Failed to edit scenario.", scenarioId, scenario.scenarioName);
                SendScenarioError($"{scenarioId} ({scenario.scenarioName}) - Failed to edit scenario.", clientMode);
            }
        }
        catch (Exception ex)
        {
            System.Console.WriteLine("Error in HandleEditScenario: " + ex.Message);
        }
    }

    public void SendAddScenario(Scenario scenario, ModeEnum clientMode)
    {
        string scenarioData = UIWebSocketServer.PrepareMessageToClient(S2CMessageType.AddScenario, scenario, clientMode);
        UIWebSocketServer.SendMsgToClients(scenarioData, clientMode);
    }
    public void SendRemoveScenario(Scenario scenario, ModeEnum clientMode)
    {
        string scenarioData = UIWebSocketServer.PrepareMessageToClient(S2CMessageType.RemoveScenario, scenario, clientMode);
        UIWebSocketServer.SendMsgToClients(scenarioData, clientMode);
    }
    public void SendEditScenario(Scenario scenario, ModeEnum clientMode)
    {
        string scenarioData = UIWebSocketServer.PrepareMessageToClient(S2CMessageType.EditScenario, scenario, clientMode);
        UIWebSocketServer.SendMsgToClients(scenarioData, clientMode);
    }
    public void SendScenarioError(string errorMsg, ModeEnum clientMode)
    {
        var scenarioError = new ScenarioError()
        {
            errorMsg = errorMsg
        };
        string scenarioErrorData = UIWebSocketServer.PrepareMessageToClient(S2CMessageType.ScenarioError, scenarioError, clientMode);
        UIWebSocketServer.SendMsgToClients(scenarioErrorData, clientMode);
    }

    private void AddIdToJamZoneJammersIds(Jammer jammer, List<Zone> zones)
    {
        List<JamZone> jamZones = zoneChecker.GetJamZonesContainingPoint(jammer.position, zones);
        if (jamZones.Count == 0)
            return;
        foreach (JamZone jamZone in jamZones)
        {
            System.Console.WriteLine(jamZone.zoneId);
            jamZone.jammersIds.Add(jammer.id);
        }
    }

    private void AddJammersIdsToJamZones(List<Sensor> jammers, List<Zone> zones)
    {
        foreach(Sensor jammer in jammers)
        {
            if(jammer is Jammer)
                AddIdToJamZoneJammersIds((Jammer)jammer, zones);
        }
    }
}