using System.Reflection.Metadata;
using System.Text.Json;

public class UIMsgHandler
{
    private readonly TrajectoryScenarioResultsManager trajectoryScenarioResultsManager;
    private readonly PlanesTrajectoryPointsScenarioHandler scenarioHandler;
    private readonly PlaySelectedScenarioHandler playSelecedScenarioHandler;
    private readonly ScenarioPlayControlHandler scenarioPlayControlHandler;

    public UIMsgHandler()
    {
        trajectoryScenarioResultsManager = new TrajectoryScenarioResultsManager();
        scenarioHandler = new PlanesTrajectoryPointsScenarioHandler(trajectoryScenarioResultsManager);
        playSelecedScenarioHandler = new PlaySelectedScenarioHandler(trajectoryScenarioResultsManager);
        scenarioPlayControlHandler = new ScenarioPlayControlHandler(trajectoryScenarioResultsManager);
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

                    case MsgTypesEnum.PlaySelectedScenarioCmd:
                        playSelecedScenarioHandler.HandlePlaySelectedScenarioCmd(wrapper.data);
                        break;

                    case MsgTypesEnum.PauseScenarioCmd:
                        scenarioPlayControlHandler.HandlePauseScenarioCmd(wrapper.data);
                        break;
                    
                    case MsgTypesEnum.ResumeScenarioCmd:
                        scenarioPlayControlHandler.HandleResumeScenarioCmd(wrapper.data);
                        break;
                    
                    case MsgTypesEnum.ChangeScenarioPlaySpeedCmd:
                        scenarioPlayControlHandler.HandleChangeScenarioPlaySpeedCmd(wrapper.data);
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
}