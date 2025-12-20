public class DronesInJamZone
{
    public string ZoneId { get; init; }
    public List<string> DroneIds { get; init; }

    public DronesInJamZone(string zoneId)
    {
        ZoneId = zoneId;
        DroneIds = new List<string>();
    }
    public void AddDroneToZone(string droneId)
    {
        if (!DroneIds.Contains(droneId))
        {
            DroneIds.Add(droneId);
        }
    }
}