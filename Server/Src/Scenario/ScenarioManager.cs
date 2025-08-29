public class ScenarioManager
{
    private static ScenarioManager instance;
    private readonly Dictionary<string, Scenario> _scenarios = new();

    private ScenarioManager() { }

    public static ScenarioManager GetInstance()
    {
        if (instance == null)
            instance = new ScenarioManager();
        return instance;
    }

    public IEnumerable<Scenario> GetAllScenarios()
    {
        return _scenarios.Values;
    }

    public bool TryAddScenario(Scenario scenario)
    {
        if (scenario == null || string.IsNullOrWhiteSpace(scenario.scenarioId))
            return false;

        if (_scenarios.ContainsKey(scenario.scenarioId))
            return false;

        _scenarios[scenario.scenarioId] = scenario;
        return true;
    }

    public Scenario? TryGetScenario(string scenarioId)
    {
        if (string.IsNullOrWhiteSpace(scenarioId))
            return null;

        _scenarios.TryGetValue(scenarioId, out var scenario);
        return scenario;
    }

    public bool TryRemoveScenario(string scenarioId)
    {
        if (string.IsNullOrWhiteSpace(scenarioId))
            return false;

        return _scenarios.Remove(scenarioId);
    }

    public bool TryEditScenario(string scenarioId, Scenario updatedScenario)
    {
        if (string.IsNullOrWhiteSpace(scenarioId) || updatedScenario == null)
            return false;

        if (!_scenarios.ContainsKey(scenarioId))
            return false;

        _scenarios[scenarioId] = updatedScenario;
        return true;
    }
}