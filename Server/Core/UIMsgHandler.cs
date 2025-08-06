using System.Reflection.Metadata;
using System.Text.Json;

public class UIMsgHandler
{
    private const double timeStepSeconds = 0.1;
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
                    case MsgTypesEnum.PlanesTrajectoryPointsEvent:
                        // Handle
                        List<List<PlaneCalculatedTrajectoryPoints>> allCalculatedTrajectoryPoints = handleTrajectoryPointsEvent(wrapper.data);
                        foreach (var trajectoryPoint in allCalculatedTrajectoryPoints)
                        {
                            foreach (var trajectoryPointEvent in trajectoryPoint)
                            {
                                foreach (var trajectoryEvent in trajectoryPointEvent.trajectoryPoints)
                                {
                                    System.Console.WriteLine(trajectoryEvent);
                                }
                            }
                        }
                        _ = SendCalculatedTrajectoryPointsAsync(allCalculatedTrajectoryPoints, timeStepSeconds);
                        break;

                    // more cases......

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

    public string prepareMessageToServer<T>(MsgTypesEnum msgType, T msg)
    {
        var message = new
        {
            type = msgType.ToString(),
            data = msg
        };

        return JsonSerializer.Serialize(message);
    }
    

private List<TrajectoryPoint> HandleSinglePlane(PlaneTrajectoryPoints plane)
{
    List<TrajectoryPoint> fullTrajectory = new List<TrajectoryPoint>();

    for (int i = 0; i < plane.geoPoints.Count - 1; i++)
    {
        GeoPoint start = plane.geoPoints[i];
        GeoPoint end = plane.geoPoints[i + 1];

        TrajectoryCalculator calculator = new TrajectoryCalculator();
        List<TrajectoryPoint> segment = calculator.ComputeTrajectory(start, end, plane.velocity,timeStepSeconds); //timeStepSeconds is a const

        if (i > 0 && segment.Count > 0)
        {
            segment.RemoveAt(0); // Avoid duplication
        }

        fullTrajectory.AddRange(segment);
    }

    return fullTrajectory;
}

    public List<List<PlaneCalculatedTrajectoryPoints>> handleTrajectoryPointsEvent(JsonElement data)
    {
        TrajectoryManager trajectoryManager = new TrajectoryManager();
        PlanesTrajectoryPointsEvent planesTrajectoryPointsEvent = data.Deserialize<PlanesTrajectoryPointsEvent>();
        List<PlaneTrajectoryPoints> planesTrajectoryPoints = planesTrajectoryPointsEvent.planes;

        foreach (PlaneTrajectoryPoints plane in planesTrajectoryPoints)
        {
            foreach (GeoPoint point in plane.geoPoints)
            {
                System.Console.WriteLine(point);
            }
            List<TrajectoryPoint> trajectory = HandleSinglePlane(plane);
            trajectoryManager.AddTrajectory(trajectory, plane.planeName);
        }

        return trajectoryManager.CalculatedTrajectoryPoints;
    }
    



    
    public async Task SendCalculatedTrajectoryPointsAsync(List<List<PlaneCalculatedTrajectoryPoints>> results, double timeStepSeconds)
    {
        System.Console.WriteLine("entered SendCalculatedTrajectoryPointsAsync");
        foreach (var result in results)
        {
            MultiPlaneTrajectoryResult multiPlaneTrajectoryResult = new MultiPlaneTrajectoryResult(result);
            var responseJson = prepareMessageToServer(MsgTypesEnum.MultiPlaneTrajectoryResult, multiPlaneTrajectoryResult);

            Program.SendMsgToClient(responseJson);

            await Task.Delay((int)(timeStepSeconds * 1000)); // wait timeStepSeconds * 1000 between each step
        }
    }
}