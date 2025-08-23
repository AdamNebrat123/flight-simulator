public class DangerZoneChecker
{
    private readonly DangerZoneManager dangerZoneManager = DangerZoneManager.GetInstance();

    public DangerZoneChecker()
    {
    }

    // Returns the names of all danger zones containing the point
    public List<string> GetZonesContainingPoint(GeoPoint point)
    {
        var zonesContainingPoint = new List<string>();

        foreach (var zone in dangerZoneManager.GetAllZones())
        {
            if (IsPointInZone(point, zone))
            {
                zonesContainingPoint.Add(zone.zoneName);
            }
        }

        return zonesContainingPoint; // empty list if point is not in any danger zone
    }

    // Checks if a point is inside a specific danger zone
    private bool IsPointInZone(GeoPoint point, DangerZone zone)
    {
        // Check height first
        if (point.altitude < zone.bottomHeight || point.altitude > zone.topHeight)
            return false;

        // Check horizontal position (2D point-in-polygon)
        return IsPointInPolygon(point, zone.points);
    }

    // Classic 2D point-in-polygon check (ray casting)
    private bool IsPointInPolygon(GeoPoint point, List<GeoPoint> polygon)
    {
        int n = polygon.Count;
        bool inside = false;

        for (int i = 0, j = n - 1; i < n; j = i++)
        {
            var pi = polygon[i];
            var pj = polygon[j];

            if (((pi.latitude > point.latitude) != (pj.latitude > point.latitude)) &&
                (point.longitude < (pj.longitude - pi.longitude) *
                 (point.latitude - pi.latitude) / (pj.latitude - pi.latitude) + pi.longitude))
            {
                inside = !inside;
            }
        }

        return inside;
    }
}
