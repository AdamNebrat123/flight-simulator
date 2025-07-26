
System.Console.WriteLine("====================================================");
System.Console.WriteLine("                          TEST");
System.Console.WriteLine("====================================================");
TrajectoryCalculator trajectoryCalculator = new TrajectoryCalculator();
GeoPoint start = new(44, 44, 100);
GeoPoint end = new(44.001, 44, 100);

List<TrajectoryPoint> trajectoryPoints = trajectoryCalculator.ComputeTrajectory(start, end, 10);
List<string> trajectoryPointsJSON = trajectoryCalculator.ConvertTrajectoryToJson(trajectoryPoints);

foreach (string str in trajectoryPointsJSON)
{
    System.Console.WriteLine(str);
}
System.Console.WriteLine("====================================================");
System.Console.WriteLine("====================================================");
System.Console.WriteLine("====================================================");
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseWebSockets();

app.Use(async (context, next) =>
{
    if (context.WebSockets.IsWebSocketRequest)
    {
        using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
        Console.WriteLine("WebSocket connected");

        var buffer = new byte[1024 * 4];
        while (true)
        {
            var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
            if (result.MessageType == System.Net.WebSockets.WebSocketMessageType.Close)
            {
                Console.WriteLine("WebSocket closed");
                await webSocket.CloseAsync(System.Net.WebSockets.WebSocketCloseStatus.NormalClosure, "Closed by server", CancellationToken.None);
                break;
            }

            var message = System.Text.Encoding.UTF8.GetString(buffer, 0, result.Count);
            Console.WriteLine("Received: " + message);

            var echoMessage = $"Echo: {message}";
            var bytes = System.Text.Encoding.UTF8.GetBytes(echoMessage);
            await webSocket.SendAsync(new ArraySegment<byte>(bytes), result.MessageType, result.EndOfMessage, CancellationToken.None);
        }
    }
    else
    {
        await next();
    }
});

app.Run();


