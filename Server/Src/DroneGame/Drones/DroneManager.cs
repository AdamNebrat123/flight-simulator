public class DroneManager
{
    private static DroneManager instance;
    private readonly Dictionary<string, Drone> _drones = new();

    private DroneManager() { }

    public static DroneManager GetInstance()
    {
        if (instance == null)
            instance = new DroneManager();
        return instance;
    }

    public IEnumerable<Drone> GetAllDrones()
    {
        return _drones.Values;
    }

    public bool TryAddDrone(Drone drone)
    {
        if (drone == null || string.IsNullOrWhiteSpace(drone.id))
            return false;

        if (_drones.ContainsKey(drone.id))
            return false;

        _drones[drone.id] = drone;
        return true;
    }

    public Drone? TryGetDrone(string id)
    {
        if (string.IsNullOrWhiteSpace(id))
            return null;

        _drones.TryGetValue(id, out var drone);
        return drone;
    }

    public bool TryRemoveDrone(string id)
    {
        if (string.IsNullOrWhiteSpace(id))
            return false;

        return _drones.Remove(id);
    }

    public bool TryUpdateDrone(string id, Drone updatedDrone)
    {
        if (string.IsNullOrWhiteSpace(id) || updatedDrone == null)
            return false;

        if (!_drones.ContainsKey(id))
            return false;

        _drones[id] = updatedDrone;
        return true;
    }
}