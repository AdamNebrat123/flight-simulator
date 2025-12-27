public class ScenarioResults
{
    public string scenarioId { get; set; }
    public string scenarioName { get; set; }
    public Dictionary<string, AircraftRuntimeData> Aircrafts { get; set; } // its the original trajectories
    public Dictionary<string, Zone> zones; // zones
    public Dictionary<string, Sensor> jammers; // jammers
    public Dictionary<string, Sensor> radars; // radars
    public bool isPaused { get; set; } = false;
    public double playSpeed { get; set; } = 1.0; // multiplier, 1.0 = normal speed
    public void Pause() => isPaused = true;
    public void Resume() => isPaused = false;
    public void SetPlaySpeed(double speed) => playSpeed = Math.Max(0.1, speed);
}