using System.Net.WebSockets;
using System.Text.Json;

public class JammerMsgHandler
{
    private static readonly JammerMsgHandler _instance = new JammerMsgHandler();
    private JammerMsgHandler()
    {
    }

    public static JammerMsgHandler GetInstance()
    {
        return _instance;
    }

    public async Task HandleIncomingMessage(WebSocket connection ,string json)
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
            JammerToC2ServerMsgType messageType;

            // try parse the wrapper.type. if fails, return
            if (!Enum.TryParse<JammerToC2ServerMsgType>(wrapper.type.Trim(), ignoreCase: true, out messageType))
            {
                Console.WriteLine($"Invalid message type: {wrapper.type}");
                return;
            }

            System.Console.WriteLine("received: " + wrapper.data);

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