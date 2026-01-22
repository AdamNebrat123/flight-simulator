public class JammerAssignmentService
{
    private static JammerAssignmentService _instance = new JammerAssignmentService();
    private readonly JammerAssignmentManager _assignmentManager = JammerAssignmentManager.GetInstance();
    private readonly PlayingScenarioData _scenarioData = PlayingScenarioData.GetInstance();

    private const int LOOP_DELAY_MS = 1000;
    
    private bool _isRunning = false;

    private JammerAssignmentService() { }

    public static JammerAssignmentService GetInstance() 
    {
        return _instance;
    } 

    public void Start()
    {
        if (_isRunning) return;
        
        _isRunning = true;
        Task.Run(() => StartLoop());
        Console.WriteLine("[JammerAssignmentService] Jammer Assignment Loop started.");
    }

    private async Task StartLoop()
    {
        while (_isRunning)
        {
            try
            {
                SkyPicture currentSky = _scenarioData.GetMostRecentSkyPicture();

                if (currentSky != null && !_scenarioData.IsJammerIdToClientMapEmpty() && _scenarioData.GetZonesWS() != null)
                {
                    await _assignmentManager.AssignJammers(currentSky);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[JammerAssignmentService] Error in loop: {ex.Message}");
            }

            await Task.Delay(LOOP_DELAY_MS);
        }
    }

    public void Stop()
    {
        _isRunning = false;
        Console.WriteLine("[JammerAssignmentService] Jammer Assignment Loop stopped.");
    }
}