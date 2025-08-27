using System.Reflection.Metadata;
using System.Text.Json;

public class UIMsgHandler
{
    // data managers
    private readonly ScenariosDataManager scenariosDataManager = ScenariosDataManager.GetInstance();
    private readonly DangerZonesDataManager dangerZonesDataManager = DangerZonesDataManager.GetInstance();

    // Handlers
    private readonly PlanesTrajectoryPointsScenarioHandler scenarioHandler = PlanesTrajectoryPointsScenarioHandler.GetInstance();
    private readonly PlaySelectedScenarioHandler playSelecedScenarioHandler = PlaySelectedScenarioHandler.GetInstance();
    private readonly ScenarioPlayControlHandler scenarioPlayControlHandler = ScenarioPlayControlHandler.GetInstance();
    private readonly GetReadyScenariosRequestHandler getReadyScenariosRequestHandler = GetReadyScenariosRequestHandler.GetInstance();
    private readonly DangerZoneHandler dangerZoneHandler;
    public UIMsgHandler()
    {
        // Handlers:
        dangerZoneHandler = new DangerZoneHandler();
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

            if (!string.IsNullOrWhiteSpace(wrapper.type) && Enum.TryParse<C2SMessageType>(wrapper.type.Trim(), ignoreCase: true, out var messageType))
            {
                switch (messageType)
                {
                    case C2SMessageType.PlanesTrajectoryPointsScenario:
                        // Handle
                        scenarioHandler.HandlePlanesTrajectoryPointsScenario(wrapper.data);
                        break;

                    case C2SMessageType.GetReadyScenariosRequestCmd:
                        getReadyScenariosRequestHandler.HandleGetReadyScenariosRequestCmd(wrapper.data);
                        break;

                    case C2SMessageType.PlaySelectedScenarioCmd:
                        playSelecedScenarioHandler.HandlePlaySelectedScenarioCmd(wrapper.data);
                        break;

                    case C2SMessageType.PauseScenarioCmd:
                        scenarioPlayControlHandler.HandlePauseScenarioCmd(wrapper.data);
                        break;
                    
                    case C2SMessageType.ResumeScenarioCmd:
                        scenarioPlayControlHandler.HandleResumeScenarioCmd(wrapper.data);
                        break;
                    
                    case C2SMessageType.ChangeScenarioPlaySpeedCmd:
                        scenarioPlayControlHandler.HandleChangeScenarioPlaySpeedCmd(wrapper.data);
                        break;

                    case C2SMessageType.AddDangerZone:
                        dangerZoneHandler.HandleAddDangerZone(wrapper.data);
                        break;

                    case C2SMessageType.RemoveDangerZone:
                        dangerZoneHandler.HandleRemoveDangerZone(wrapper.data);
                        break;

                    case C2SMessageType.EditDangerZone:
                        dangerZoneHandler.HandleEditDanger(wrapper.data);
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