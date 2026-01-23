using System.Net.WebSockets;
using System.Text.Json;

public class ZonesMsgHandler
{
    private static readonly ZonesMsgHandler _instance = new ZonesMsgHandler();
    private readonly ZoneHandler _zoneHandler = ZoneHandler.GetInstance();
    private readonly PlayingScenarioData playingScenarioData = PlayingScenarioData.GetInstance();

    private ZonesMsgHandler()
    {
    }

    public static ZonesMsgHandler GetInstance()
    {
        return _instance;
    }
    public async Task HandleIncomingMessage(ZonesWebSocketClient zonesWS, string json)
    {
        try
        {
            var wrapper = JsonSerializer.Deserialize<MessageWrapper>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (wrapper == null || string.IsNullOrWhiteSpace(wrapper.type))
            {
                return;
            }

            // Parse enum
            ZonesToC2ServerMsgType messageType;

            // try parse the wrapper.type. if fails, return
            if (!Enum.TryParse<ZonesToC2ServerMsgType>(wrapper.type.Trim(), ignoreCase: true, out messageType))
            {
                Console.WriteLine($"Invalid message type: {wrapper.type}");
                return;
            }

            System.Console.WriteLine("received: " + json);
            switch (messageType)
            {
                
                case ZonesToC2ServerMsgType.InitialZones:
                    System.Console.WriteLine("wrapper.data " + wrapper.data);
                    _zoneHandler.HandleInitialZones(wrapper.data, zonesWS);
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
    public void HandleDisconnection(ZonesWebSocketClient zonesWebSocketClient)
    {
        List<Zone> zones = playingScenarioData.GetZones();
        foreach (Zone zone in zones)
        {
            _zoneHandler.SendRemoveZone(zone);
        }
        playingScenarioData.ClearZones();
        playingScenarioData.SetZonesWS(null);
    }
}