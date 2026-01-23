using System.Net.WebSockets;
using System.Text.Json;

public class JammerHandler
{
    private static JammerHandler instance;
    private readonly JammerManager jammerManager = JammerManager.GetInstance();
    private readonly PlayingScenarioData playingScenarioData = PlayingScenarioData.GetInstance();
    private readonly ZoneChecker zoneChecker = new();


    private JammerHandler()
    {
    }

    public static JammerHandler GetInstance()
    {
        if (instance == null)
            instance = new JammerHandler();
        return instance;
    }

    public void HandleAddOrUpdateJammer(JsonElement data, JammerWebSocketClient jammerWebSocket)
    {
        Jammer jammer = JsonSerializer.Deserialize<Jammer>(data);
        // first check if jammer id is already set in websocket manager
        if (!playingScenarioData.IsJammerAlreadySet(jammer.id))
        {
            playingScenarioData.TryAddJammerClientMapping(jammer.id, jammerWebSocket);
        }

        Jammer existingJammer = jammerManager.GetJammerById(jammer.id);
        if(existingJammer == null)
        {
            // it means jammerManager does not contain him.
            HandleAddJammer(jammer);
            SendAddJammer(jammer);
            System.Console.WriteLine("sent jammer add");
            return;
        }

        // if he is not null, he already exists

        // i will check if his status was updated
        bool isUpdated = false;
        if(existingJammer.status != jammer.status)
        {
            HandleUpdateJammerStatus(jammer);
            isUpdated = true;
        }
        // i will check if his jamMode was updated
        if(existingJammer.jamMode != jammer.jamMode)
        {
            HandleUpdateJammerJamMode(jammer);
            isUpdated = true;
        }

        if(isUpdated)
        {
            SendEditJammer(jammer);
        }

    }
    public void HandleAddJammer(Jammer jammer)
    {
        try
        {
            AddIdToJamZoneJammersIds(jammer);
            
            // add to manager map
            bool isAdded = jammerManager.TryAddJammer(jammer);
        }
        catch (Exception ex)
        {
            System.Console.WriteLine("Error in HandleAddJammer: " + ex.Message);
        }
    }

    public void HandleRemoveJammer(JsonElement data)
    {
        try
        {
            Jammer jammer = JsonSerializer.Deserialize<Jammer>(data);
            
            RemoveIdFromJammersIds(jammer);
            var jammerId = jammer.id;
            
                var isRemoved = jammerManager.TryRemoveJammer(jammerId);
                if (isRemoved)
                {
                    System.Console.WriteLine("{0} - Removed jammer successfully.", jammerId);
                }
                else
                {
                    System.Console.WriteLine("{0} - Failed to remove jammer from manager.", jammerId);
                }
        }
        catch (Exception ex)
        {
            System.Console.WriteLine("Error in HandleRemoveJammer: " + ex.Message);
        }
    }

    public void HandleUpdateJammerStatus(Jammer jammer)
    {
        try
        {
            string jammerId = jammer.id;
            var isEdited = jammerManager.TryUpdateJammerStatus(jammer);
            if (isEdited)
            {
                System.Console.WriteLine("{0} - Edited jammer successfully.", jammerId);
            }
            else
            {
                System.Console.WriteLine("{0} - Failed to edit jammer in manager.", jammerId);
            }
        }
        catch (Exception ex)
        {
            System.Console.WriteLine("Error in HandleEditJammer: " + ex.Message);
        }
    }
    public void HandleUpdateJammerJamMode(Jammer jammer)
    {
        try
        {
            string jammerId = jammer.id;
        
            var isEdited = jammerManager.TryUpdateJammerJamMode(jammer);
            if (isEdited)
            {
                System.Console.WriteLine("{0} - Edited jammer successfully.", jammerId);
            }
            else
            {
                System.Console.WriteLine("{0} - Failed to edit jammer in manager.", jammerId);
            }
        }
        catch (Exception ex)
        {
            System.Console.WriteLine("Error in HandleEditJammer: " + ex.Message);
        }
    }
    public void SendAddJammer(Jammer jammer)
    {
        string data = UIWebSocketServer.PrepareMessageToClient(S2CMessageType.AddJammer, jammer);
        UIWebSocketServer.SendMsgToClients(data);
    }

    public void SendRemoveJammer(Jammer jammer)
    {
        string data = UIWebSocketServer.PrepareMessageToClient(S2CMessageType.RemoveJammer, jammer);
        UIWebSocketServer.SendMsgToClients(data);
    }

    public void SendEditJammer(Jammer jammer)
    {
        string data = UIWebSocketServer.PrepareMessageToClient(S2CMessageType.EditJammer, jammer);
        UIWebSocketServer.SendMsgToClients(data);
    }

    private void AddIdToJamZoneJammersIds(Jammer jammer)
    {
        List<JamZone> jamZones = zoneChecker.GetJamZonesContainingPoint(jammer.position);
        if (jamZones.Count == 0)
            return;
        foreach (JamZone jamZone in jamZones)
        {
            System.Console.WriteLine(jamZone.zoneId);
            if(!jamZone.jammersIds.Contains(jammer.id))
                jamZone.jammersIds.Add(jammer.id);
        }
        
    }
    private void RemoveIdFromJammersIds(Jammer jammer)
    {
        List<JamZone> jamZones = zoneChecker.GetJamZonesContainingPoint(jammer.position);
        if (jamZones.Count == 0)
            return;
        foreach (JamZone jamZone in jamZones)
        {
            jamZone.jammersIds.Remove(jammer.id);
        }
        
    }
}
