using System.Collections.Concurrent;
using System.Text.Json;

public class ScenarioResultsManager
{
    private static ScenarioResultsManager _instance;
    private readonly ConcurrentDictionary<string, ScenarioResults> _scenarios
        = new ConcurrentDictionary<string, ScenarioResults>();

    private ScenarioResultsManager()
    {
    }
    public static ScenarioResultsManager GetInstance()
    {
        if (_instance == null)
            _instance = new ScenarioResultsManager();
        return _instance;
    }
    public bool TryAddScenario(string scenarioId, ScenarioResults scenarioResult)
    {
        if (_scenarios.ContainsKey(scenarioId))
        {
            return false; // already exists
        }

        _scenarios[scenarioId] = scenarioResult;
        System.Console.WriteLine("added result " + scenarioId);
        return true; // added successfully
    }
    
    public bool TryEditScenario(string scenarioId, ScenarioResults newScenarioResult)
    {
        if (_scenarios.ContainsKey(scenarioId))
        {
            // TryUpdate takes the key, the new value, and the expected old value.
            // We need the current value first.
            if (_scenarios.TryGetValue(scenarioId, out var oldScenario))
            {
                return _scenarios.TryUpdate(scenarioId, newScenarioResult, oldScenario);
            }
        }
        return false; // not found
    }

    public ScenarioResults? GetScenarioResult(string scenarioId)
    {
        if (_scenarios.TryGetValue(scenarioId, out var scenario))
        {
            return scenario;
        }
        return null;
    }
    public ScenarioResults? GetCopyOfScenarioResult(string scenarioId)
    {
        if (_scenarios.TryGetValue(scenarioId, out var scenario))
        {
            if(scenario == null)
            {
                System.Console.WriteLine(scenarioId);
                System.Console.WriteLine("NULL SCENARIO!!!!!!!!");
                return null;
            }
            var serialized = JsonSerializer.Serialize(scenario);
            return JsonSerializer.Deserialize<ScenarioResults>(serialized);
        }
        return null;
    }

    public bool HasScenario(string scenarioId)
    {
        return _scenarios.ContainsKey(scenarioId);
    }

    public List<string> GetAllScenariosIds()
    {
        return _scenarios.Keys.ToList();
    }
}