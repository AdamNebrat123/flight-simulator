public class TrajectoryScenarioResultsManager
{
    private readonly Dictionary<string, List<MultiPlaneTrajectoryResult>> _scenarios
        = new Dictionary<string, List<MultiPlaneTrajectoryResult>>();

    public void AddResults(string scenarioName, IEnumerable<MultiPlaneTrajectoryResult> results)
    {
        if (!_scenarios.ContainsKey(scenarioName))
        {
            _scenarios[scenarioName] = new List<MultiPlaneTrajectoryResult>();
        }
        _scenarios[scenarioName].AddRange(results);
    }
    public List<MultiPlaneTrajectoryResult> GetResults(string scenarioName)
{
    if (_scenarios.TryGetValue(scenarioName, out var results))
    {
        return new List<MultiPlaneTrajectoryResult>(results);
    }
    return new List<MultiPlaneTrajectoryResult>();
}
    
    public bool HasScenario(string scenarioName)
    {
        return _scenarios.ContainsKey(scenarioName);
    }
}