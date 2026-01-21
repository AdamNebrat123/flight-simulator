using System.Text.Json;

public class JammerHandler
{
    private static JammerHandler instance;
    private readonly JammerManager jammerManager = JammerManager.GetInstance();
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

    public void HandleAddOrUpdateJammer(JsonElement data)
    {
        Jammer jammer = JsonSerializer.Deserialize<Jammer>(data);

        Jammer existingJammer = jammerManager.GetJammerById(jammer.id);
        if(existingJammer == null)
        {
            // it means jammerManager does not contain him.
            HandleAddJammer(jammer);
            return;
        }

        // if he is not null, he already exists
        // i will check if his status was updated
        if(existingJammer.status != jammer.status)
        {
            HandleUpdateJammerStatus(jammer);
        }

    }
    public void HandleAddJammer(Jammer jammer)
    {
        try
        {
            AddIdToJamZoneJammersIds(jammer);
            
            // add to manager map
            bool isAdded = jammerManager.TryAddJammer(jammer);
            if (isAdded)
            {
                System.Console.WriteLine("{0} ({1}) - Added jammer successfully.", jammer.id, jammer.id);
            }
            else
            {
                System.Console.WriteLine("{0} - Failed to add jammer.", jammer.id);
            }
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
            
                var isEdited = jammerManager.TryEditJammer(jammerId, jammer);
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
            
                var isEdited = jammerManager.TryEditJammer(jammerId, jammer);
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


    private void AddIdToJamZoneJammersIds(Jammer jammer)
    {
        List<JamZone> jamZones = zoneChecker.GetJamZonesContainingPoint(jammer.position);
        if (jamZones.Count == 0)
            return;
        foreach (JamZone jamZone in jamZones)
        {
            System.Console.WriteLine(jamZone.zoneId);
            jamZone.jammersIds.Add(jammer.id);
            System.Console.WriteLine(string.Join(",", jamZone.jammersIds));
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
