using System.Text.Json;

public class JammerHandler
{
    private static JammerHandler instance;
    private readonly JammerManager jammerManager = JammerManager.GetInstance();
    private readonly JammersDataManager jammersDataManager = JammersDataManager.GetInstance();

    private JammerHandler()
    {
    }

    public static JammerHandler GetInstance()
    {
        if (instance == null)
            instance = new JammerHandler();
        return instance;
    }

    public void HandleAddJammer(JsonElement data, ModeEnum clientMode)
    {
        try
        {
            Jammer jammer = JsonSerializer.Deserialize<Jammer>(data);

            // unique ID
            Guid uuid = Guid.NewGuid();
            jammer.id = uuid.ToString();

            // add to file/db
            jammersDataManager.AddAndSaveJammer(jammer);

            // add to manager map
            bool isAdded = jammerManager.TryAddJammer(jammer);
            if (isAdded)
            {
                System.Console.WriteLine("{0} ({1}) - Added jammer successfully.", jammer.id, jammer.id);
                SendAddJammer(jammer, clientMode);
            }
            else
            {
                System.Console.WriteLine("{0} - Failed to add jammer.", jammer.id);
                SendJammerError($"{jammer.id} - Failed to add jammer.", clientMode);
            }
        }
        catch (Exception ex)
        {
            System.Console.WriteLine("Error in HandleAddJammer: " + ex.Message);
        }
    }

    public void HandleRemoveJammer(JsonElement data, ModeEnum clientMode)
    {
        try
        {
            Jammer jammer = JsonSerializer.Deserialize<Jammer>(data);
            string jammerId = jammer.id;

            bool isRemoved = jammersDataManager.RemoveAndSaveJammer(jammerId);
            if (isRemoved)
            {
                isRemoved = jammerManager.TryRemoveJammer(jammerId);
                if (isRemoved)
                {
                    System.Console.WriteLine("{0} - Removed jammer successfully.", jammerId);
                    SendRemoveJammer(jammer, clientMode);
                }
                else
                {
                    System.Console.WriteLine("{0} - Failed to remove jammer from manager.", jammerId);
                    SendJammerError($"{jammerId} - Failed to remove jammer from manager.", clientMode);
                }
            }
            else
            {
                System.Console.WriteLine("{0} - Failed to remove jammer from file.", jammerId);
                SendJammerError($"{jammerId} - Failed to remove jammer from file.", clientMode);
            }
        }
        catch (Exception ex)
        {
            System.Console.WriteLine("Error in HandleRemoveJammer: " + ex.Message);
        }
    }

    public void HandleEditJammer(JsonElement data, ModeEnum clientMode)
    {
        try
        {
            Jammer jammer = JsonSerializer.Deserialize<Jammer>(data);
            string jammerId = jammer.id;

            bool isEdited = jammersDataManager.EditAndSaveJammer(jammerId, jammer);
            if (isEdited)
            {
                isEdited = jammerManager.TryEditJammer(jammerId, jammer);
                if (isEdited)
                {
                    System.Console.WriteLine("{0} - Edited jammer successfully.", jammerId);
                    SendEditJammer(jammer, clientMode);
                }
                else
                {
                    System.Console.WriteLine("{0} - Failed to edit jammer in manager.", jammerId);
                    SendJammerError($"{jammerId} - Failed to edit jammer in manager.", clientMode);
                }
            }
            else
            {
                System.Console.WriteLine("{0} - Failed to edit jammer in file.", jammerId);
                SendJammerError($"{jammerId} - Failed to edit jammer in file.", clientMode);
            }
        }
        catch (Exception ex)
        {
            System.Console.WriteLine("Error in HandleEditJammer: " + ex.Message);
        }
    }

    public void SendAddJammer(Jammer jammer, ModeEnum clientMode)
    {
        string data = WebSocketServer.prepareMessageToClient(S2CMessageType.AddJammer, jammer, clientMode);
        WebSocketServer.SendMsgToClients(data, clientMode);
    }

    public void SendRemoveJammer(Jammer jammer, ModeEnum clientMode)
    {
        string data = WebSocketServer.prepareMessageToClient(S2CMessageType.RemoveJammer, jammer, clientMode);
        WebSocketServer.SendMsgToClients(data, clientMode);
    }

    public void SendEditJammer(Jammer jammer, ModeEnum clientMode)
    {
        string data = WebSocketServer.prepareMessageToClient(S2CMessageType.EditJammer, jammer, clientMode);
        WebSocketServer.SendMsgToClients(data, clientMode);
    }

    public void SendJammerError(string errorMsg, ModeEnum clientMode)
    {
        JammerError error = new JammerError() { errorMsg = errorMsg };
        string data = WebSocketServer.prepareMessageToClient(S2CMessageType.JammerError, error, clientMode);
        WebSocketServer.SendMsgToClients(data, clientMode);
    }
}
