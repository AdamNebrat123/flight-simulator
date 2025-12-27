using System.Net.WebSockets;
using System.Collections.Concurrent;
using System.Linq;
using System.Collections.Generic;

public class WebSocketManager
{
    private static readonly WebSocketManager _instance = new WebSocketManager();
    // list of WebSocket connections
    private ConcurrentBag<WebSocket> _connections = new();

    private WebSocketManager() {}
    public static WebSocketManager GetInstance() => _instance;

    public void AddConnection(WebSocket socket)
    {
        _connections.Add(socket);
    }

    public void RemoveConnection(WebSocket socket)
    {
        if (_connections.Contains(socket))
        {
            // Remove socket from bag (ConcurrentBag does not support removal, so recreate)
            var newBag = new ConcurrentBag<WebSocket>(_connections.Where(ws => ws != socket));
            _connections = newBag;
        }
    }


    public IEnumerable<WebSocket> GetConnections()
    {
        return _connections.ToArray();
    }
}
