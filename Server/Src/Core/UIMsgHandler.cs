using System.Net.WebSockets;
using System.Reflection.Metadata;
using System.Text.Json;

public class UIMsgHandler
{
    // Handlers
    private readonly WebSocketModeHandler webSocketModeHandler = WebSocketModeHandler.GetInstance();
    private readonly PlaySelectedScenarioHandler playSelecedScenarioHandler = PlaySelectedScenarioHandler.GetInstance();
    private readonly ScenarioPlayControlHandler scenarioPlayControlHandler = ScenarioPlayControlHandler.GetInstance();
    private readonly ZoneHandler dangerZoneHandler = ZoneHandler.GetInstance();
    private readonly ScenarioHandler scenarioHandler = ScenarioHandler.GetInstance();
    private readonly DroneGameHandler droneHandler = DroneGameHandler.GetInstance();
    private readonly FreeFlightHandler freeFlightHandler = FreeFlightHandler.GetInstance();
    private readonly CreateBulletHandler createBulletHandler = CreateBulletHandler.GetInstance();

    public UIMsgHandler()
    {
    }

    public async Task HandleIncomingMessage(WebSocket connection ,string json)
    {
        try
        {
            var wrapper = JsonSerializer.Deserialize<MessageWrapper>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (wrapper == null || string.IsNullOrWhiteSpace(wrapper.type) || string.IsNullOrWhiteSpace(wrapper.clientMode))
            {
                //Console.WriteLine($"Invalid message: missing type or mode. type={wrapper?.type}, mode={wrapper?.mode}");
                return;
            }

            // Parse enums
            C2SMessageType messageType;
            ModeEnum clientMode;

            // try parse the wrapper.type. if fails, return
            if (!Enum.TryParse<C2SMessageType>(wrapper.type.Trim(), ignoreCase: true, out messageType))
            {
                Console.WriteLine($"Invalid message type: {wrapper.type}");
                return;
            }
            // try parse the wrapper.mode. if fails, return
            if (!Enum.TryParse<ModeEnum>(wrapper.clientMode.Trim(), ignoreCase: true, out clientMode))
            {
                Console.WriteLine($"Invalid mode: {wrapper.clientMode}");
                return;
            }


            // Now, both enums parsed and can used as needed
            switch (messageType)
            {
                case C2SMessageType.ClientMode:
                    webSocketModeHandler.HandleClientModeMsg(connection, clientMode);
                    break;
                case C2SMessageType.AddScenario:
                    scenarioHandler.HandleAddScenario(wrapper.data, clientMode);
                    break;

                case C2SMessageType.RemoveScenario:
                    scenarioHandler.HandleRemoveScenario(wrapper.data, clientMode);
                    break;

                case C2SMessageType.EditScenario:
                    scenarioHandler.HandleEditScenario(wrapper.data, clientMode);
                    break;

                case C2SMessageType.AddDangerZone:
                    dangerZoneHandler.HandleAddZone(wrapper.data, clientMode);
                    break;

                case C2SMessageType.RemoveDangerZone:
                    dangerZoneHandler.HandleRemoveZone(wrapper.data, clientMode);
                    break;

                case C2SMessageType.EditDangerZone:
                    dangerZoneHandler.HandleEditZone(wrapper.data, clientMode);
                    break;

                case C2SMessageType.PlaySelectedScenarioCmd:
                    playSelecedScenarioHandler.HandlePlaySelectedScenarioCmd(wrapper.data, clientMode);
                    break;

                case C2SMessageType.PauseScenarioCmd:
                    scenarioPlayControlHandler.HandlePauseScenarioCmd(wrapper.data, clientMode);
                    break;

                case C2SMessageType.ResumeScenarioCmd:
                    scenarioPlayControlHandler.HandleResumeScenarioCmd(wrapper.data, clientMode);
                    break;

                case C2SMessageType.ChangeScenarioPlaySpeedCmd:
                    scenarioPlayControlHandler.HandleChangeScenarioPlaySpeedCmd(wrapper.data, clientMode);
                    break;

                case C2SMessageType.RemoveDrone:
                    if (clientMode == ModeEnum.DroneGame)
                        droneHandler.HandleRemoveDrone(wrapper.data, clientMode);
                    else if (clientMode == ModeEnum.FreeFlight)
                        freeFlightHandler.HandleRemoveDrone(wrapper.data, clientMode);
                    break;

                case C2SMessageType.UpdateDrone:
                    if (clientMode == ModeEnum.DroneGame)
                        droneHandler.HandleUpdateDrone(wrapper.data, clientMode);
                    else if (clientMode == ModeEnum.FreeFlight)
                        freeFlightHandler.HandleUpdateDrone(wrapper.data, clientMode);
                    break;

                case C2SMessageType.RequestDroneInitData:
                    if (clientMode == ModeEnum.DroneGame)
                        droneHandler.HandleRequestDronesInitData(connection, wrapper.data, clientMode);
                    else if (clientMode == ModeEnum.FreeFlight)
                        freeFlightHandler.HandleRequestDronesInitData(connection, wrapper.data, clientMode);
                    break;

                case C2SMessageType.CreateBullet:
                    createBulletHandler.HandleCreateBullet(wrapper.data, clientMode);
                    break;

                default:
                    Console.WriteLine("Unhandled message type.");
                    break;
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