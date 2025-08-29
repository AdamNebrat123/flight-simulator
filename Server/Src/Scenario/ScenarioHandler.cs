using System.Text.Json;

public class ScenarioHandler
{
    private static ScenarioHandler instance;
    private readonly ScenarioManager scenarioManager = ScenarioManager.GetInstance();
    private readonly ScenariosDataManager scenariosDataManager = ScenariosDataManager.GetInstance();
    private readonly ScenarioResultsManager scenarioResultsManager = ScenarioResultsManager.GetInstance();
    private readonly ScenarioResultsCalculator scenarioResultsCalculator = ScenarioResultsCalculator.GetInstance();

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

    public void HandleAddScenario(JsonElement data)
    {
        try
        {
            Scenario scenario = data.Deserialize<Scenario>();

            // create a new unique ID for the scenario
            Guid uuid = Guid.NewGuid();
            string uuidString = uuid.ToString();
            scenario.scenarioId = uuidString;

            // create a new unique ID for every plane
            foreach (PlaneTrajectoryPoints plane in scenario.planes)
            {
                Guid planeUuid = Guid.NewGuid();
                string planeUuidString = planeUuid.ToString();
                plane.planeId = planeUuidString;
            }

            // add in file
            scenariosDataManager.AddScenario(scenario);

            // add in a map 
            bool isAdded = scenarioManager.TryAddScenario(scenario);
            if (isAdded)
            {
                System.Console.WriteLine("{0} ({1}) - Added scenario successfully.", scenario.scenarioId, scenario.scenarioName);
                SendAddScenario(scenario);

                // calculate scenario results
                ScenarioResults? scenarioResults = scenarioResultsCalculator.CalculateScenarioResults(scenario);
                if (scenarioResults != null)
                {
                    // save the calculated scenario
                    scenarioResultsManager.TryAddScenario(scenario.scenarioId, scenarioResults);
                }
            }
            else
            {
                System.Console.WriteLine("{0} ({1}) - Failed to add scenario.", scenario.scenarioId, scenario.scenarioName);
                SendScenarioError($"{scenario.scenarioId} ({scenario.scenarioName}) - Failed to add scenario.");
            }
        }
        catch (Exception ex)
        {
            System.Console.WriteLine("Error in HandleAddScenario: " + ex.Message);
        }
    }

    public void HandleRemoveScenario(JsonElement data)
    {
        try
        {
            Scenario scenario = data.Deserialize<Scenario>();
            string scenarioId = scenario.scenarioId;

            bool isRemoved = scenariosDataManager.RemoveScenario(scenarioId);
            if (isRemoved)
            {
                isRemoved = scenarioManager.TryRemoveScenario(scenarioId);
                if (isRemoved)
                {
                    System.Console.WriteLine("{0} ({1}) - Removed scenario successfully.", scenarioId, scenario.scenarioName);
                    SendRemoveScenario(scenario);
                }
                else
                {
                    System.Console.WriteLine("{0} ({1}) - Failed to remove scenario.", scenarioId, scenario.scenarioName);
                    SendScenarioError($"{scenarioId} ({scenario.scenarioName}) - Failed to remove scenario.");
                }
            }
            else
            {
                System.Console.WriteLine("{0} ({1}) - Failed to remove scenario.", scenarioId, scenario.scenarioName);
                SendScenarioError($"{scenarioId} ({scenario.scenarioName}) - Failed to remove scenario.");
            }
        }
        catch (Exception ex)
        {
            System.Console.WriteLine("Error in HandleRemoveScenario: " + ex.Message);
        }
    }

    public void HandleEditScenario(JsonElement data)
    {
        try
        {
            Scenario scenario = data.Deserialize<Scenario>();
            string scenarioId = scenario.scenarioId;

            bool isEdited = scenariosDataManager.EditScenario(scenarioId, scenario);
            if (isEdited)
            {
                isEdited = scenarioManager.TryEditScenario(scenarioId, scenario);
                if (isEdited)
                {
                    System.Console.WriteLine("{0} ({1}) - Edited scenario successfully.", scenarioId, scenario.scenarioName);
                    SendEditScenario(scenario);
                }
                else
                {
                    System.Console.WriteLine("{0} ({1}) - Failed to edit scenario.", scenarioId, scenario.scenarioName);
                    SendScenarioError($"{scenarioId} ({scenario.scenarioName}) - Failed to edit scenario.");
                }
            }
            else
            {
                System.Console.WriteLine("{0} ({1}) - Failed to edit scenario.", scenarioId, scenario.scenarioName);
                SendScenarioError($"{scenarioId} ({scenario.scenarioName}) - Failed to edit scenario.");
            }
        }
        catch (Exception ex)
        {
            System.Console.WriteLine("Error in HandleEditScenario: " + ex.Message);
        }
    }

    public void SendAddScenario(Scenario scenario)
    {
        string scenarioData = WebSocketServer.prepareMessageToClient(S2CMessageType.AddScenario, scenario);
        WebSocketServer.SendMsgToClient(scenarioData);
    }
    public void SendRemoveScenario(Scenario scenario)
    {
        string scenarioData = WebSocketServer.prepareMessageToClient(S2CMessageType.RemoveScenario, scenario);
        WebSocketServer.SendMsgToClient(scenarioData);
    }
    public void SendEditScenario(Scenario scenario)
    {
        string scenarioData = WebSocketServer.prepareMessageToClient(S2CMessageType.EditScenario, scenario);
        WebSocketServer.SendMsgToClient(scenarioData);
    }
    public void SendScenarioError(string errorMsg)
    {
        var scenarioError = new ScenarioError()
        {
            errorMsg = errorMsg
        };
        string scenarioErrorData = WebSocketServer.prepareMessageToClient(S2CMessageType.ScenarioError, scenarioError);
        WebSocketServer.SendMsgToClient(scenarioErrorData);
    }
}