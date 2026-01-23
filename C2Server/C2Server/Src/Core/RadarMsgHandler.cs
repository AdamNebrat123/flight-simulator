using System.Net.WebSockets;
using System.Text.Json;

public class RadarMsgHandler
{
    private static readonly RadarMsgHandler _instance = new RadarMsgHandler();
    private readonly RadarHandler _radarHandler = RadarHandler.GetInstance();
    private RadarMsgHandler()
    {
    }

    public static RadarMsgHandler GetInstance()
    {
        return _instance;
    }
    public async Task HandleIncomingMessage(RadarWebSocketClient radarWebSocket ,string json)
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
            RadarToC2ServerMsgType messageType;

            // try parse the wrapper.type. if fails, return
            if (!Enum.TryParse<RadarToC2ServerMsgType>(wrapper.type.Trim(), ignoreCase: true, out messageType))
            {
                Console.WriteLine($"Invalid message type: {wrapper.type}");
                return;
            }

            System.Console.WriteLine("" + wrapper.data);
            switch (messageType)
            {
                case RadarToC2ServerMsgType.RadarUpdate:
                    _radarHandler.HandleRadarUpdate(wrapper.data, radarWebSocket);
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