public class ScenarioResults
{
    public List<MultiPlaneTrajectoryResult> points { get; set; } = new List<MultiPlaneTrajectoryResult>();
    public bool isPaused { get; set; } = false;
    public double playSpeed { get; set; } = 1.0; // multiplier, 1.0 = normal speed
    public void Pause() => isPaused = true;
    public void Resume() => isPaused = false;
    public void SetPlaySpeed(double speed) => playSpeed = Math.Max(0.1, speed);
}