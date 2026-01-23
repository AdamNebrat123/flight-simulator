public class ScenarioWebSocketAllocation
{
    public string ScenarioId { get; }

    public Dictionary<string, JammerWebSocketServer> JammerMap { get; } = new();
    public RadarWebSocketServer RadarWS { get; set; }

    public ZonesWebSocketServer ZonesWS { get; set; }

    public ScenarioWebSocketAllocation(string scenarioId)
    {
        ScenarioId = scenarioId;
    }
}
