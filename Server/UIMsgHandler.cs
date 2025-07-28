using System.Reflection.Metadata;
using System.Text.Json;

public class UIMsgHandler
{
    public async Task HandleIncomingMessage(string json)
    {
        try
        {
            var wrapper = JsonSerializer.Deserialize<MessageWrapper>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
            Console.WriteLine("Deserialized Type: " + wrapper?.Type);

            if (!string.IsNullOrWhiteSpace(wrapper.Type) && Enum.TryParse<MsgTypesEnum>(wrapper.Type.Trim(), ignoreCase: true, out var messageType))
            {
                switch (messageType)
                {
                    case MsgTypesEnum.TrajectoryPoints:
                        // Handle
                        List<TrajectoryPoint> trajectoryPoints = handleTrajectoryPointsEvent(wrapper);

                        // Prepeare the response
                        string responseJson = prepareMessageToServer(MsgTypesEnum.CalculatedTrajectoryPoints, trajectoryPoints);

                        // Send to client
                        Program.SendMsgToClient(responseJson);
                        break;

                    // more cases......

                    default:
                        Console.WriteLine("Unhandled message type.");
                        break;
                }

            }
            else
            {
                Console.WriteLine("Invalid message type: " + wrapper.Type);
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

    public string prepareMessageToServer<T>(MsgTypesEnum msgType, T msg)
    {
        var message = new
        {
            type = msgType.ToString(),
            data = msg
        };

        return JsonSerializer.Serialize(message);
    }


    public List<TrajectoryPoint> handleTrajectoryPointsEvent(MessageWrapper wrapper)
    {
        TrajectoryPointsEvent trajectoryPointsEvent = wrapper.Data.Deserialize<TrajectoryPointsEvent>();
        List<GeoPoint> clientSelectedPoints = trajectoryPointsEvent.GeoPoints;
        double velocity = trajectoryPointsEvent.Velocity;

        //handle
        TrajectoryCalculator trajectoryCalculator = new TrajectoryCalculator();
        List<TrajectoryPoint> trajectoryPoints = trajectoryCalculator.ComputeTrajectory(clientSelectedPoints[0], clientSelectedPoints[1], velocity);

        return trajectoryPoints;
    }
}