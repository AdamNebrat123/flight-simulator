using System.Net.WebSockets;
using System.Text.Json;

public class JammerMsgHandler
{
    private static readonly JammerMsgHandler _instance = new JammerMsgHandler();
    private readonly JammerHandler _jammerHandler = JammerHandler.GetInstance();
    private readonly PlayingScenarioData playingScenarioData = PlayingScenarioData.GetInstance();
    private readonly JammerManager jammerManager = JammerManager.GetInstance();
    private JammerMsgHandler()
    {
    }

    public static JammerMsgHandler GetInstance()
    {
        return _instance;
    }

    public async Task HandleIncomingMessage(JammerWebSocketClient jammerWebSocket, string json)
    {
        try
        {
            var wrapper = JsonSerializer.Deserialize<MessageWrapper>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (wrapper == null || string.IsNullOrWhiteSpace(wrapper.type))
                return;

            // Parse enum
            JammerToC2ServerMsgType messageType;

            // try parse the wrapper.type. if fails, return
            if (!Enum.TryParse<JammerToC2ServerMsgType>(wrapper.type.Trim(), ignoreCase: true, out messageType))
            {
                Console.WriteLine($"Invalid message type: {wrapper.type}");
                return;
            }


            switch (messageType)
            {
                case JammerToC2ServerMsgType.JammerStatus:
                    _jammerHandler.HandleAddOrUpdateJammer(wrapper.data, jammerWebSocket);
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
    public void HandleDisconnection(JammerWebSocketClient jammerWebSocket)
    {
        bool isRemoved = playingScenarioData.TryRemoveJammerByClient(jammerWebSocket, out string? jammerId);
        if (jammerId != null && isRemoved)
        {
            Jammer jammer = jammerManager.GetJammerById(jammerId);
            // send remove to ui
            _jammerHandler.SendRemoveJammer(jammer);

            // remove from manager
            jammerManager.TryRemoveJammer(jammerId);
        }
    }
}