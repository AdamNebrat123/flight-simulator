using System.Reflection.Metadata;
using System.Text.Json;

public class UIMsgHandler
{
    // managers
    private readonly ScenariosDataManager scenariosDataManager = ScenariosDataManager.GetInstance();
    private readonly DangerZonesDataManager dangerZonesDataManager = DangerZonesDataManager.GetInstance();
    private readonly DangerZoneManager dangerZoneManager;

    // Handlers
    private readonly PlanesTrajectoryPointsScenarioHandler scenarioHandler = PlanesTrajectoryPointsScenarioHandler.GetInstance();
    private readonly PlaySelectedScenarioHandler playSelecedScenarioHandler = PlaySelectedScenarioHandler.GetInstance();
    private readonly ScenarioPlayControlHandler scenarioPlayControlHandler = ScenarioPlayControlHandler.GetInstance();
    private readonly GetReadyScenariosRequestHandler getReadyScenariosRequestHandler = GetReadyScenariosRequestHandler.GetInstance();
    private readonly DangerZoneHandler dangerZoneHandler;
    public UIMsgHandler()
    {
        // Danger zones related things.
        dangerZoneManager = DangerZoneManager.GetInstance(); // manager
        // Handlers:
        dangerZoneHandler = new DangerZoneHandler(dangerZoneManager);
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
                        getReadyScenariosRequestHandler.HandleGetReadyScenariosRequestCmd(wrapper.data);
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

                    case MsgTypesEnum.DangerZone:
                        dangerZoneHandler.handleDangerZone(wrapper.data);
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