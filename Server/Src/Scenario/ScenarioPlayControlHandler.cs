using System.Text.Json;

public class ScenarioPlayControlHandler
{
    private readonly TrajectoryScenarioResultsManager trajectoryScenarioResultsManager = TrajectoryScenarioResultsManager.GetInstance();

    private static ScenarioPlayControlHandler _instance;

    private ScenarioPlayControlHandler()
    {
    }

    public static ScenarioPlayControlHandler GetInstance()
    {
        if (_instance == null)
            _instance = new ScenarioPlayControlHandler();
        return _instance;
    }

    public void HandlePauseScenarioCmd(JsonElement data)
    {
        try
        {
            PauseScenarioCmd pauseScenarioCmd = data.Deserialize<PauseScenarioCmd>();
            string scenarioName = pauseScenarioCmd.scenarioName;
            ScenarioResults scenarioResults = trajectoryScenarioResultsManager.GetScenarioResult(scenarioName);
            scenarioResults.Pause();
            System.Console.WriteLine(scenarioName + " paused");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in HandlePauseScenarioCmd: {ex.Message}");
        }
    }

    public void HandleResumeScenarioCmd(JsonElement data)
    {
        try
        {
            ResumeScenarioCmd resumeScenarioCmd = data.Deserialize<ResumeScenarioCmd>();
            string scenarioName = resumeScenarioCmd.scenarioName;
            ScenarioResults scenarioResults = trajectoryScenarioResultsManager.GetScenarioResult(scenarioName);
            scenarioResults.Resume();
            System.Console.WriteLine(scenarioName + " resumed");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in HandleResumeScenarioCmd: {ex.Message}");
        }
    }

    public void HandleChangeScenarioPlaySpeedCmd(JsonElement data)
    {
        try
        {
            ChangeScenarioPlaySpeedCmd changeScenarioPlaySpeedCmd = data.Deserialize<ChangeScenarioPlaySpeedCmd>();
            string scenarioName = changeScenarioPlaySpeedCmd.scenarioName;
            double playSpeed = changeScenarioPlaySpeedCmd.playSpeed;
            ScenarioResults scenarioResults = trajectoryScenarioResultsManager.GetScenarioResult(scenarioName);
            scenarioResults.SetPlaySpeed(playSpeed);
            System.Console.WriteLine(scenarioName + " play speed is set to: " + playSpeed);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in HandleChangeScenarioPlaySpeedCmd: {ex.Message}");
        }
    }
}
