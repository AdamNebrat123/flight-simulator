using System.Reflection.Metadata;
using System.Text.Json;

public class UIMsgHandler
{
    private const double timeStepSeconds = 0.1;
    private readonly TrajectoryScenarioResultsManager trajectoryScenarioResultsManager;
    private readonly PlanesTrajectoryPointsScenarioHandler scenarioHandler;
    private readonly PlaySelectedScenarioHandler playSelecedScenarioHandler;

    public UIMsgHandler()
    {
        trajectoryScenarioResultsManager = new TrajectoryScenarioResultsManager();
        //for testing only!!!!!!
        //===============================================================================================
        //===============================================================================================
        //===============================================================================================
        trajectoryScenarioResultsManager.AddResults("Scenario1", new List<MultiPlaneTrajectoryResult>());
        trajectoryScenarioResultsManager.AddResults("Scenario2", new List<MultiPlaneTrajectoryResult>());
        trajectoryScenarioResultsManager.AddResults("Scenario3", new List<MultiPlaneTrajectoryResult>());
        trajectoryScenarioResultsManager.AddResults("Scenario4", new List<MultiPlaneTrajectoryResult>());
        //===============================================================================================
        //===============================================================================================
        //===============================================================================================
        scenarioHandler = new PlanesTrajectoryPointsScenarioHandler(trajectoryScenarioResultsManager);
        playSelecedScenarioHandler = new PlaySelectedScenarioHandler(trajectoryScenarioResultsManager);
    }

    public async Task HandleIncomingMessage(string json)
    {
        try
        {
            var wrapper = JsonSerializer.Deserialize<MessageWrapper>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
            Console.WriteLine("Deserialized Type: " + wrapper?.type);

            if (!string.IsNullOrWhiteSpace(wrapper.type) && Enum.TryParse<MsgTypesEnum>(wrapper.type.Trim(), ignoreCase: true, out var messageType))
            {
                switch (messageType)
                {
                    case MsgTypesEnum.PlanesTrajectoryPointsScenario:
                        // Handle
                        scenarioHandler.HandlePlanesTrajectoryPointsScenario(wrapper.data);
                        break;

                    case MsgTypesEnum.GetReadyScenariosRequestCmd:
                        // testing
                        List<string> allScenariosNames = trajectoryScenarioResultsManager.GetAllScenariosNames();
                        ScenariosReadyToPlay scenariosReadyToPlay = new ScenariosReadyToPlay
                        {
                            scenariosNames = allScenariosNames,
                        };
                        string response = Program.prepareMessageToServer(MsgTypesEnum.ScenariosReadyToPlay, scenariosReadyToPlay);
                        Program.SendMsgToClient(response);
                        break;

                    case MsgTypesEnum.PlaySelectedScenario:
                        //temporary for testing purpose!!!!!!!
                        playSelecedScenarioHandler.HandlePlaySelectedScenario(wrapper.data);
                        break;

                    default:
                        Console.WriteLine("Unhandled message type.");
                        break;
                }

            }
            else
            {
                Console.WriteLine("Invalid message type: " + wrapper.type);
            }
        }
        catch (NullReferenceException ex)
        {
            Console.WriteLine("the msg is null..  " + ex.Message);
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error handling message: " + ex.Message);
        }
    }

    public async Task SendCalculatedTrajectoryPointsAsync(List<MultiPlaneTrajectoryResult> results, double timeStepSeconds)
    {
        System.Console.WriteLine("entered SendCalculatedTrajectoryPointsAsync");
        foreach (var result in results)
        {
            var responseJson = Program.prepareMessageToServer(MsgTypesEnum.MultiPlaneTrajectoryResult, result);

            Program.SendMsgToClient(responseJson);

            await Task.Delay((int)(timeStepSeconds * 1000)); // wait timeStepSeconds * 1000 between each step
        }
    }
}