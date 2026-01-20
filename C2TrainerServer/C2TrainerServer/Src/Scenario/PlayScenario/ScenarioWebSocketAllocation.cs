public class ScenarioWebSocketAllocation
{
    public string ScenarioId { get; }

    public Dictionary<string, JammerWebSocketServer> JammerMap { get; } = new();
    public Dictionary<string, RadarWebSocketServer> RadarMap { get; } = new();

    public ZonesWebSocketServer ZonesWS { get; set; }

    public ScenarioWebSocketAllocation(string scenarioId)
    {
        ScenarioId = scenarioId;
    }
}
