public static class DirectionalAssignmentProcessor
{
    public static void AssignDirectionalJammers(IEnumerable<DroneCoverageContext> drones, IEnumerable<Jammer> jammers)
    {
        foreach (DroneCoverageContext droneCtx in drones)
        {
            // if already covered by omni, continue
            if (droneCtx.CoveredBy == CoveredBy.Omnidirectional)
                continue;

            var jammer = DirectionalJammerSelector.FindClosestAvailableJammer(jammers, droneCtx);

            if (jammer == null)
                continue;

            // Now assign jammer to directional mode
            jammer.StartDirectionalJamming(CalculateDirection(jammer, droneCtx.Drone));

            droneCtx.CoveredBy = CoveredBy.Directional;
        }
    }

private static double CalculateDirection(Jammer jammer, DroneStatus drone)
{
    // אם המכשיר מותקן בסטייה (למשל צפון המכשיר פונה למזרח העולם)
    // אם התיקון ב-Cesium עובד, השאר את זה 0.
    double offset = 0.0; 

    // וודא שאתה לוקח את המיקום העדכני ביותר ולא את הנקודה הראשונה במסלול!
    var currentDronePos = drone.trajectoryPoints.Last().position; 

    double lat1 = DegreesToRadians(jammer.position.latitude);
    double lon1 = DegreesToRadians(jammer.position.longitude);
    double lat2 = DegreesToRadians(currentDronePos.latitude);
    double lon2 = DegreesToRadians(currentDronePos.longitude);

    double deltaLon = lon2 - lon1;

    double y = Math.Sin(deltaLon) * Math.Cos(lat2);
    double x = Math.Cos(lat1) * Math.Sin(lat2) -
               Math.Sin(lat1) * Math.Cos(lat2) * Math.Cos(deltaLon);

    double radians = Math.Atan2(y, x);
    double degrees = RadiansToDegrees(radians);

    // נרמול ל-0 עד 360 (צפון = 0, מזרח = 90)
    double bearing = (degrees + offset + 360) % 360;

    return bearing;
}
private static double DegreesToRadians(double deg) => deg * Math.PI / 180.0;
private static double RadiansToDegrees(double rad) => rad * 180.0 / Math.PI;

}
