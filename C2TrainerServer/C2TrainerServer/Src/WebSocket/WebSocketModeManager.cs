using System.Net.WebSockets;
using System.Collections.Concurrent;
using System.Linq;
using System.Collections.Generic;

public class WebSocketModeManager
{
    // Dictionary mapping WebSocket to its mode
    private readonly ConcurrentDictionary<WebSocket, ModeEnum> _connectionModes = new();
    private static readonly WebSocketModeManager _instance = new WebSocketModeManager();
    // Dictionary mapping mode to list of WebSocket connections
    private readonly ConcurrentDictionary<ModeEnum, ConcurrentBag<WebSocket>> _modeConnections = new();

    private WebSocketModeManager() {}
    public static WebSocketModeManager GetInstance() => _instance;

    public void AddConnection(WebSocket socket, ModeEnum mode)
    {
        _connectionModes[socket] = mode;
        var bag = _modeConnections.GetOrAdd(mode, _ => new ConcurrentBag<WebSocket>());
        bag.Add(socket);
    }

    public void RemoveConnection(WebSocket socket)
    {
        if (_connectionModes.TryRemove(socket, out var mode))
        {
            if (_modeConnections.TryGetValue(mode, out var bag))
            {
                // Remove socket from bag (ConcurrentBag does not support removal, so recreate)
                var newBag = new ConcurrentBag<WebSocket>(bag.Where(ws => ws != socket));
                _modeConnections[mode] = newBag;
            }
        }
    }

    public ModeEnum? GetMode(WebSocket socket)
    {
        if (_connectionModes.TryGetValue(socket, out var mode))
            return mode;
        return null;
    }

    public IEnumerable<WebSocket> GetConnectionsInMode(ModeEnum mode)
    {
        if (_modeConnections.TryGetValue(mode, out var bag))
            return bag.ToArray();
        return Enumerable.Empty<WebSocket>();
    }
}
