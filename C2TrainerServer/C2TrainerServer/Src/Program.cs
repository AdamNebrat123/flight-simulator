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

        // =======================================================================
        // =======================================================================
        // =======================================================================
        // =======================================================================
        // ==============================TEMPORARY================================
        
        var zones = new List<Zone>
        {
            new JamZone
            {
                zoneId = "ac19092c-c960-4d3f-8d2b-57aba687fdc5",
                zoneName = "ZoneName",
                topHeight = 10000,
                bottomHeight = 0,
                jammersIds = new List<string>
                {
                    "0d993b29-9beb-428d-82be-11b78f07baed",
                    "70ee1e13-bbe4-48ee-90df-b031095aa1d1",
                    "328d67f1-5ffa-4682-a54e-dc0edaaed202"
                },
                points = new List<GeoPoint>
                {
                    new GeoPoint(34.84223233650855, 32.06090962055034, 87.03494859043121),
                    new GeoPoint(34.74025181436869, 32.08849123065517, 34.02852938335154),
                    new GeoPoint(34.70749032287997, 32.02397082151187, 35.45153999671648),
                    new GeoPoint(34.83445042325035, 31.986254007749828, 82.83529601720943),
                    new GeoPoint(34.872283113190754, 32.02112630223357, 79.95778249231257)
                }
            }
        };


        var jammers = new List<Sensor>
{
    new Jammer
    {
        id = "0d993b29-9beb-428d-82be-11b78f07baed",
        position = new GeoPoint(
            34.78278713219179,
            32.03644584731649,
            40.534588190710075
        ),
        status = Status.Online,
        jamMode = JamMode.None,
        supportedFrequencies = new List<Frequency>
        {
            Frequency.Rc_24GHz,
            Frequency.Rc_58GHz,
            Frequency.GNSS_L1,
            Frequency.GNSS_L2
        },
        radius = 400,
        directionDegrees = null
    },

    new Jammer
    {
        id = "70ee1e13-bbe4-48ee-90df-b031095aa1d1",
        position = new GeoPoint(
            34.78599440721986,
            32.03212610830705,
            43.9155719989818
        ),
        status = Status.Online,
        jamMode = JamMode.Directional,
        supportedFrequencies = new List<Frequency>
        {
            Frequency.GNSS_L2,
            Frequency.GNSS_L1,
            Frequency.Rc_58GHz,
            Frequency.Rc_24GHz
        },
        radius = 450,
        directionDegrees = 90
    },

    new Jammer
    {
        id = "328d67f1-5ffa-4682-a54e-dc0edaaed202",
        position = new GeoPoint(
            34.78039932832487,
            32.033365319657705,
            41.732868987071676
        ),
        status = Status.Online,
        jamMode = JamMode.None,
        supportedFrequencies = new List<Frequency>
        {
            Frequency.Rc_24GHz,
            Frequency.Rc_58GHz,
            Frequency.GNSS_L1,
            Frequency.GNSS_L2
        },
        radius = 300,
        directionDegrees = null
    }
};

        List<Sensor> radars = new List<Sensor>();
        Scenario scenario1 = allSceanrios.First();
        scenario1.zones = zones;
        scenario1.jammers = jammers;
        scenario1.radars = radars;
        // =======================================================================
        // =======================================================================
        // =======================================================================
        // =======================================================================
        // =======================================================================
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
                ScenarioResults scenarioResults = scenarioResultsCalculator.CalculateScenarioResults(scenario);
                System.Console.WriteLine(scenarioResults.jammers.Count.ToString() + " jammers in scenario results");
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
