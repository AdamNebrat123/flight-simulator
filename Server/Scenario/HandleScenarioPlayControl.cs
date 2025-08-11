using System.Text.Json;

public class HandleScenarioPlayControl
{
    private readonly TrajectoryScenarioResultsManager trajectoryScenarioResultsManager;
    public HandleScenarioPlayControl(TrajectoryScenarioResultsManager trajectoryScenarioResultsManager)
    {
        this.trajectoryScenarioResultsManager = trajectoryScenarioResultsManager;
    }
    public void HandlePauseScenarioCmd(JsonElement data)
    {
        try
        {
            PauseScenarioCmd pauseScenarioCmd = data.Deserialize<PauseScenarioCmd>();
            string scenarioName = pauseScenarioCmd.scenarioName;
            ScenarioResults scenarioResults = trajectoryScenarioResultsManager.GetResults(scenarioName);
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
            ScenarioResults scenarioResults = trajectoryScenarioResultsManager.GetResults(scenarioName);
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
            ScenarioResults scenarioResults = trajectoryScenarioResultsManager.GetResults(scenarioName);
            scenarioResults.SetPlaySpeed(playSpeed);
            System.Console.WriteLine(scenarioName + " play speed is set to: " + playSpeed);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in HandleChangeScenarioPlaySpeedCmd: {ex.Message}");
        }
    }
}