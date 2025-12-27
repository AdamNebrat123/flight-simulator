using System.Net.WebSockets;
using System.Reflection.Metadata;
using System.Text.Json;

public class UIMsgHandler
{
    // Handlers
    private readonly WebSocketHandler webSocketModeHandler = WebSocketHandler.GetInstance();
    private readonly ZoneHandler dangerZoneHandler = ZoneHandler.GetInstance();
    private readonly JammerHandler jammerHandler = JammerHandler.GetInstance();

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
                return;
            }

            // Parse enums
            C2SMessageType messageType;

            // try parse the wrapper.type. if fails, return
            if (!Enum.TryParse<C2SMessageType>(wrapper.type.Trim(), ignoreCase: true, out messageType))
            {
                Console.WriteLine($"Invalid message type: {wrapper.type}");
                return;
            }


            switch (messageType)
            {
                

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