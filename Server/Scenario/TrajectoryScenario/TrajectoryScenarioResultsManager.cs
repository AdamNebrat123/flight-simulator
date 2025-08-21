using System.Collections.Concurrent;

public class TrajectoryScenarioResultsManager
{
    private static TrajectoryScenarioResultsManager instance;
    private readonly ConcurrentDictionary<string, ScenarioResults> _scenarios
        = new ConcurrentDictionary<string, ScenarioResults>();

    private TrajectoryScenarioResultsManager()
    {
    }
    public static TrajectoryScenarioResultsManager GetInstance()
    {
        if (instance == null)
            instance = new TrajectoryScenarioResultsManager();
        return instance;
    }
    public bool TryAddScenario(string scenarioName, ScenarioResults scenarioResult)
    {
        if (_scenarios.ContainsKey(scenarioName))
        {
            return false; // already exists
        }

        _scenarios[scenarioName] = scenarioResult;
        return true; // added successfully
    }

    public ScenarioResults? GetResults(string scenarioName)
    {
        if (_scenarios.TryGetValue(scenarioName, out var scenario))
        {
            return scenario;
        }
        return null;
    }

    public bool HasScenario(string scenarioName)
    {
        return _scenarios.ContainsKey(scenarioName);
    }

    public List<string> GetAllScenariosNames()
    {
        return _scenarios.Keys.ToList();
    }
}