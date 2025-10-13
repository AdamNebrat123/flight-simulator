using System.Text.Json;

public class ScenarioPlayControlHandler
{
    private readonly ScenarioResultsManager trajectoryScenarioResultsManager = ScenarioResultsManager.GetInstance();

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

    public void HandlePauseScenarioCmd(JsonElement data, ModeEnum clientMode)
    {
        try
        {
            PauseScenarioCmd pauseScenarioCmd = data.Deserialize<PauseScenarioCmd>();
            string scenarioId = pauseScenarioCmd.scenarioId;
            ScenarioResults scenarioResults = trajectoryScenarioResultsManager.GetScenarioResult(scenarioId);
            scenarioResults.Pause();
            System.Console.WriteLine(scenarioId + " paused");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in HandlePauseScenarioCmd: {ex.Message}");
        }
    }

    public void HandleResumeScenarioCmd(JsonElement data, ModeEnum clientMode)
    {
        try
        {
            ResumeScenarioCmd resumeScenarioCmd = data.Deserialize<ResumeScenarioCmd>();
            string scenarioId = resumeScenarioCmd.scenarioId;
            ScenarioResults scenarioResults = trajectoryScenarioResultsManager.GetScenarioResult(scenarioId);
            scenarioResults.Resume();
            System.Console.WriteLine(scenarioId + " resumed");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in HandleResumeScenarioCmd: {ex.Message}");
        }
    }

    public void HandleChangeScenarioPlaySpeedCmd(JsonElement data, ModeEnum clientMode)
    {
        try
        {
            ChangeScenarioPlaySpeedCmd changeScenarioPlaySpeedCmd = data.Deserialize<ChangeScenarioPlaySpeedCmd>();
            string scenarioId = changeScenarioPlaySpeedCmd.scenarioId;
            double playSpeed = changeScenarioPlaySpeedCmd.playSpeed;
            ScenarioResults scenarioResults = trajectoryScenarioResultsManager.GetScenarioResult(scenarioId);
            scenarioResults.SetPlaySpeed(playSpeed);
            System.Console.WriteLine(scenarioId + " play speed is set to: " + playSpeed);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in HandleChangeScenarioPlaySpeedCmd: {ex.Message}");
        }
    }
}
