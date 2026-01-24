using System.Text.Json;
using System.Threading.Channels;

public class PlaySelectedScenarioHandler
{
    public const double timeStepSeconds = 0.1;
    private readonly ScenarioResultsManager trajectoryScenarioResultsManager = ScenarioResultsManager.GetInstance();
    private readonly ScenarioWebsocketsManager scenarioWebsocketsManager = ScenarioWebsocketsManager.GetInstance();
    private ScenarioResults _scenarioCopy;
    private ScenarioWebSocketAllocation _allocation;
    private JammersStatusSender _jammersStatusSender;

    private static PlaySelectedScenarioHandler _instance;

    private PlaySelectedScenarioHandler()
    {
    }

    public static PlaySelectedScenarioHandler GetInstance()
    {
        if (_instance == null)
            _instance = new PlaySelectedScenarioHandler();
        return _instance;
    }

    public void HandlePlaySelectedScenarioCmd(JsonElement data, ModeEnum clientMode)
    {
        PlaySelectedScenarioCmd playSelecedScenario = data.Deserialize<PlaySelectedScenarioCmd>();
        string scenarioId = playSelecedScenario.scenarioId;
        ScenarioResults scenarioResults = trajectoryScenarioResultsManager.GetScenarioResult(scenarioId);
        if (scenarioResults != null)
            PlayScenarioAsync(scenarioResults);
        else
            System.Console.WriteLine(scenarioId + " doesnt exist.....");
    }

    public async Task PlayScenarioAsync(
        ScenarioResults originalScenario)
    {

        System.Console.WriteLine("Playing scenario: " + originalScenario.scenarioId);
        var history = new Dictionary<string, Queue<TrajectoryPoint>>();

        originalScenario.Resume();
        originalScenario.SetPlaySpeed(1.0);

        // set current ScenarioResults
        _scenarioCopy = trajectoryScenarioResultsManager.GetCopyOfScenarioResult(originalScenario.scenarioId);
        //====================================================================================================


        System.Console.WriteLine("Scenario copy created");
        // allocate websockets for this scenario
        _allocation = scenarioWebsocketsManager.AllocateForScenario(_scenarioCopy);
        System.Console.WriteLine("Websockets allocated for scenario");
        // start websockets
        scenarioWebsocketsManager.StartWebsocketsByAllocation(_allocation);

        // start jammers status sender
        StartJammersStatusSender();


        // prepare radar updates
        Dictionary<string, AircraftRuntimeData>? runtimeAircrafts = _scenarioCopy.Aircrafts;

        while (runtimeAircrafts.Values.Any(a => a.Trajectory.Count > 0))
        {
            while (originalScenario.isPaused)
                await Task.Delay(100);

            var snapshot = new ScenarioAirCraftsSnapshot(new List<AircraftStatus>())
            {
                scenarioId = originalScenario.scenarioId
            };

            foreach (var aircraft in runtimeAircrafts.Values)
            {
                if (aircraft.Trajectory.Count == 0)
                    continue;

                var point = aircraft.Trajectory.Dequeue();

                if (!history.ContainsKey(aircraft.AircraftId))
                    history[aircraft.AircraftId] = new Queue<TrajectoryPoint>();

                history[aircraft.AircraftId].Enqueue(point);
                if (history[aircraft.AircraftId].Count > 30)
                    history[aircraft.AircraftId].Dequeue();

                string json1 = JsonSerializer.Serialize(aircraft.Aircraft);
                System.Console.WriteLine("Aircraft AircraftRuntimeData: " + json1);
                AircraftStatus aircraftStatus = aircraft.Aircraft.CreateStatus(point);
                string json2 = JsonSerializer.Serialize(aircraftStatus);
                System.Console.WriteLine("Aircraft status: " + json2);

                aircraftStatus.tailPoints = history[aircraft.AircraftId].ToList();

                snapshot.aircrafts.Add(aircraftStatus);
            }

            SkyPicture skyPicture = new SkyPicture(snapshot);
            RadarUpdate radarUpdate = new RadarUpdate
            {
                skyPicture = skyPicture
            };
            
            // send radar update
            SendRadarUpdate(radarUpdate, _allocation, _scenarioCopy);

            // send radar update to UI
            SendRadarUpdateToUI(radarUpdate);

            int delay = (int)(timeStepSeconds * 1000 / originalScenario.playSpeed);
            await Task.Delay(delay);
        }

        // stop jammers status sender
        await StopJammersStatusSender();

        // release websockets
        await scenarioWebsocketsManager.StopWebsocketsByAllocation(_allocation);
        // reset scenario defaults
        originalScenario.Resume();
        originalScenario.SetPlaySpeed(1.0);
    }

    private void SendRadarUpdate(RadarUpdate radarUpdate, ScenarioWebSocketAllocation allocation, ScenarioResults scenarioResults)
    {
        // send to all in the first radar
        RadarWebSocketServer radarWS = allocation.RadarWS;
        if(radarWS != null){
            string msgType = RadarToC2ServerMsgType.RadarUpdate.ToString();
            string json = WebSocketServer.prepareMessageToClient(msgType, radarUpdate);
            radarWS.Enqueue(json);
        }
    }

    private void StartJammersStatusSender()
    {
        _jammersStatusSender = new JammersStatusSender(_allocation, _scenarioCopy, 1000);
        _jammersStatusSender.Start();
    }
    private async Task StopJammersStatusSender()
    {
        if(_jammersStatusSender != null)
            await _jammersStatusSender.StopAsync();
    }
    public void SendRadarUpdateToUI(RadarUpdate radarUpdate)
    {
        string msgType = RadarToC2ServerMsgType.RadarUpdate.ToString();
        string json = UIWebSocketServer.PrepareMessageToClient(S2CMessageType.RadarUpdate, radarUpdate, ModeEnum.ScenarioSimulator);
        UIWebSocketServer.SendMsgToClients(json, ModeEnum.ScenarioSimulator);
    }
}
