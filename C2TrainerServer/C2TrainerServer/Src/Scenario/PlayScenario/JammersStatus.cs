public class JammersStatusSender
{
    private readonly ScenarioWebSocketAllocation _allocation;
    private readonly ScenarioResults _scenarioResults;
    private readonly int _intervalMs;

    private CancellationTokenSource? _cts;
    private Task? _loopTask;

    public JammersStatusSender(
        ScenarioWebSocketAllocation allocation,
        ScenarioResults scenarioResults,
        int intervalMs = 1000)
    {
        _allocation = allocation;
        _scenarioResults = scenarioResults;
        _intervalMs = intervalMs;
    }

    public void Start()
    {
        if (_cts != null)
            return; // already running

        _cts = new CancellationTokenSource();
        _loopTask = RunAsync(_cts.Token);
    }

    public async Task StopAsync()
    {
        if (_cts == null)
            return;

        _cts.Cancel();

        try
        {
            if (_loopTask != null)
                await _loopTask;
        }
        catch (OperationCanceledException)
        {
            // expected
        }

        _cts.Dispose();
        _cts = null;
        _loopTask = null;
    }

    private async Task RunAsync(CancellationToken token)
    {
        try
        {
            while (!token.IsCancellationRequested)
            {
                if (!_scenarioResults.isPaused)
                {
                    SendJammersUpdate(_allocation, _scenarioResults);
                }

                await Task.Delay(_intervalMs, token);
            }
        }
        catch (OperationCanceledException)
        {
            // normal shutdown
        }
    }

    private void SendJammersUpdate(
        ScenarioWebSocketAllocation allocation,
        ScenarioResults scenarioResults)
    {
        // this function sends the jammers status to their allocated websockets
        // so the C2 server can update the jammer status on its side if needed
        foreach (var jammer in scenarioResults.jammers.Values)
        {
            JammerWebSocketServer? jammerWS = null;
            if (allocation.JammerMap.TryGetValue(jammer.id, out jammerWS))
            {
                if (jammerWS != null)
                    jammerWS.Enqueue(jammer);
            }
        }
    }
    
}
