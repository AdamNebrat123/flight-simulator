using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Collections.Concurrent;

public class Program
{
    public static async Task Main(string[] args)
    {
        System.Console.WriteLine("--------------------------------------------------------------");

        WebSocketClientManager webSocketClientManager = WebSocketClientManager.GetInstance();

        string serverIp = "127.0.0.1";
        int zonesPort = 9001;
        int radarPort = 9002;
        
        List<int> jammerPorts = new List<int> { 6001, 6002, 6003, 6004, 6005 };

        webSocketClientManager.InitializeClients(serverIp, zonesPort, radarPort, jammerPorts);
        webSocketClientManager.StartAll();

        // start jammer assignment service
        JammerAssignmentService jammerAssignmentService = JammerAssignmentService.GetInstance();
        jammerAssignmentService.Start();

        UIWebSocketServer.Start();
    }
    
}
