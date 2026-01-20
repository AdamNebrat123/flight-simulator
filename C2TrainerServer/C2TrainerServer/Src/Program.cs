using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Collections.Concurrent;

public class Program
{
    public static async Task Main(string[] args)
    {
        System.Console.WriteLine("--------------------------------------------------------------");
        ScenarioWebsocketsManager.GetInstance().InitWebsocketsByConfig();
        ScenarioResults scenario = new ScenarioResults
        {
            scenarioId = "scenario_001",
            scenarioName = "Test Scenario",

            Aircrafts = new Dictionary<string, AircraftRuntimeData>(),

            zones = new Dictionary<string, Zone>
            {
                { "zone1", new DangerZone{zoneId = "zone1"} },
                { "zone2", new DangerZone{zoneId = "zone2"} },
                { "zone3", new DangerZone{zoneId = "zone3"} },
                { "zone4", new JamZone{zoneId = "zone4"} },
                { "zone5", new JamZone{zoneId = "zone5"} },
            },

            jammers = new Dictionary<string, Sensor>
            {
                { "jammer1", new Sensor{id = "jammer1"} },
                { "jammer2", new Sensor{id = "jammer2"} },
                { "jammer3", new Sensor{id = "jammer3"} },
                { "jammer4", new Sensor{id = "jammer4"} },
                { "jammer5", new Sensor{id = "jammer5"} },
            },

            radars = new Dictionary<string, Sensor>
            {
                { "radar1", new Sensor{id = "radar1"} }
            },

            isPaused = false,
            playSpeed = 1.0
        };
        
        PlaySelectedScenarioHandler playHandler = PlaySelectedScenarioHandler.GetInstance();
        await playHandler.PlayScenarioAsync(scenario);
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
