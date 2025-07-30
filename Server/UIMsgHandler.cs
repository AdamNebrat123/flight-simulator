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
                        List<List<TrajectoryPoint>> allCalculatedTrajectoryPoints = handleTrajectoryPointsEvent(wrapper);

                        _ = SendCalculatedTrajectoryPointsAsync(allCalculatedTrajectoryPoints);
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


    public List<List<TrajectoryPoint>> handleTrajectoryPointsEvent(MessageWrapper wrapper)
    {
        TrajectoryManager trajectoryManager = new TrajectoryManager();

        TrajectoryPointsEvent trajectoryPointsEvent = wrapper.Data.Deserialize<TrajectoryPointsEvent>();
        List<GeoPoint> clientSelectedPoints = trajectoryPointsEvent.GeoPoints;
        double velocity = trajectoryPointsEvent.Velocity;

        //handle
        TrajectoryCalculator trajectoryCalculator = new TrajectoryCalculator();
        List<TrajectoryPoint> calculatedTrajectoryPoints = trajectoryCalculator.ComputeTrajectory(clientSelectedPoints[0], clientSelectedPoints[1], velocity);

        trajectoryManager.AddTrajectory(calculatedTrajectoryPoints);

        return trajectoryManager.CalculatedTrajectoryPoints;
    }

    public async Task SendCalculatedTrajectoryPointsAsync(List<List<TrajectoryPoint>> points)
    {
        foreach (var point in points)
        {
            var responseJson = prepareMessageToServer(MsgTypesEnum.CalculatedTrajectoryPoints, point);

            Program.SendMsgToClient(responseJson); 

            await Task.Delay(1000); // wait 1 second between each step
        }
    }
}