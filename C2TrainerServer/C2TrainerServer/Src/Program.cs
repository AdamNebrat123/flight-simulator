using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Collections.Concurrent;

public class Program
{
    public static async Task Main(string[] args)
    {
        // load existing data (if existing)
        LoadDataFromFiles();

        // start the UI 
        UIWebSocketServer.Start();
    }


    public static void LoadDataFromFiles()
    {
        ScenariosDataManager scenariosDataManager = ScenariosDataManager.GetInstance();
        scenariosDataManager.ReadData();

        List<Scenario> allSceanrios = scenariosDataManager.GetScenarios();
        ScenarioManager scenarioManager = ScenarioManager.GetInstance();
        ScenarioResultsCalculator scenarioResultsCalculator = ScenarioResultsCalculator.GetInstance();
        ScenarioResultsManager scenarioResultsManager = ScenarioResultsManager.GetInstance();

        // calculate results of existing scenarios
        foreach (var scenario in allSceanrios)
        {
            // store existing scenario in a map from a file
            bool isAdded = scenarioManager.TryAddScenario(scenario);
            if (isAdded)
            {
                System.Console.WriteLine("{0} ({1}) - Added scenario successfully.", scenario.scenarioId, scenario.scenarioName);
                ScenarioResults scenarioResults = scenarioResultsCalculator.CalculateScenarioResults(scenario)!;
                // save the calculated scenario
                scenarioResultsManager.TryAddScenario(scenario.scenarioId, scenarioResults);
            }
            else
            {
                System.Console.WriteLine("{0} ({1}) - Failed to add scenario.", scenario.scenarioId, scenario.scenarioName);
            }
        }
    }
}
