using System.Text.Json;
public class TrajectoryCalculator
{
    // Earth's mean radius in meters (used for converting geo coords to Cartesian)
    private const double EarthRadius = 6371000;

    /// <summary>
    /// Computes the linear trajectory points between start and end GeoPoints,
    /// given a constant velocity (m/s). Each returned point corresponds to
    /// the position after each second.
    /// </summary>
    public List<TrajectoryPoint> ComputeTrajectory(GeoPoint start, GeoPoint end, double velocityMetersPerSecond)
    {
        var result = new List<TrajectoryPoint>();

        // Convert geographic coordinates (lat, lon, height) to Cartesian coordinates (x,y,z)
        var startCart = GeoToCartesian(start);
        var endCart = GeoToCartesian(end);

        // Calculate vector difference between start and end in Cartesian coordinates
        double dx = endCart.X - startCart.X;
        double dy = endCart.Y - startCart.Y;
        double dz = endCart.Z - startCart.Z;

        // Calculate the straight-line 3D distance between points
        double distance = Math.Sqrt(dx * dx + dy * dy + dz * dz);

        // Calculate total flight duration in seconds (floor to integer)
        int durationSeconds = (int)Math.Floor(distance / velocityMetersPerSecond);

        // Generate interpolated points for each second (including start and end)
        for (int t = 0; t <= durationSeconds; t++)
        {
            // Alpha is interpolation fraction between 0 (start) and 1 (end)
            double alpha = (double)t / durationSeconds;

            // Calculate interpolated Cartesian coordinates
            double x = startCart.X + alpha * dx;
            double y = startCart.Y + alpha * dy;
            double z = startCart.Z + alpha * dz;

            // Convert Cartesian coordinates back to geographic coordinates
            GeoPoint geoPoint = CartesianToGeo(x, y, z);

            double heading = 0; // Horizontal direction angle in degrees
            double pitch = 0;   // Vertical angle in degrees

            // Calculate heading and pitch angles toward the next point,
            // except for the last point which has no next point
            if (t < durationSeconds)
            {
                double x2 = startCart.X + ((double)(t + 1) / durationSeconds) * dx;
                double y2 = startCart.Y + ((double)(t + 1) / durationSeconds) * dy;
                double z2 = startCart.Z + ((double)(t + 1) / durationSeconds) * dz;

                (heading, pitch) = CalculateHeadingAndPitch(x, y, z, x2, y2, z2);
            }

            // Add the interpolated point with calculated angles to the result list
            result.Add(new TrajectoryPoint(geoPoint, heading, pitch));
        }

        return result;
    }

    /// <summary>
    /// Converts geographic coordinates (latitude, longitude, height) to
    /// Earth-Centered Earth-Fixed (ECEF) Cartesian coordinates (X, Y, Z).
    /// </summary>
    private (double X, double Y, double Z) GeoToCartesian(GeoPoint point)
    {
        double latRad = DegreesToRadians(point.Latitude);
        double lonRad = DegreesToRadians(point.Longitude);
        double radius = EarthRadius + point.Height;

        // ECEF formula
        double x = radius * Math.Cos(latRad) * Math.Cos(lonRad);
        double y = radius * Math.Cos(latRad) * Math.Sin(lonRad);
        double z = radius * Math.Sin(latRad);

        return (x, y, z);
    }

    /// <summary>
    /// Converts Cartesian coordinates (X, Y, Z) back to geographic coordinates
    /// (longitude, latitude, height).
    /// </summary>
    private GeoPoint CartesianToGeo(double x, double y, double z)
    {
        double hyp = Math.Sqrt(x * x + y * y);
        double lonRad = Math.Atan2(y, x);
        double latRad = Math.Atan2(z, hyp);
        double radius = Math.Sqrt(x * x + y * y + z * z);
        double height = radius - EarthRadius;

        return new GeoPoint(
            longitude: RadiansToDegrees(lonRad),
            latitude: RadiansToDegrees(latRad),
            height: height
        );
    }

    /// <summary>
    /// Calculates the heading (azimuth) and pitch (elevation angle) between
    /// two Cartesian points.
    /// Heading is the compass direction from the first point to the second,
    /// measured clockwise from North.
    /// Pitch is the vertical angle, positive if going upward.
    /// </summary>
    private (double heading, double pitch) CalculateHeadingAndPitch(double x1, double y1, double z1, double x2, double y2, double z2)
    {
        double dx = x2 - x1;
        double dy = y2 - y1;
        double dz = z2 - z1;

        // Calculate heading (bearing) in XY plane, from North (Y-axis)
        double headingRad = Math.Atan2(dx, dy);
        double headingDeg = (RadiansToDegrees(headingRad) + 360) % 360;

        // Calculate pitch angle relative to horizontal plane
        double horizontalDistance = Math.Sqrt(dx * dx + dy * dy);
        double pitchRad = Math.Atan2(dz, horizontalDistance);
        double pitchDeg = RadiansToDegrees(pitchRad);

        return (headingDeg, pitchDeg);
    }

    /// <summary>
    /// Helper to convert degrees to radians.
    /// </summary>
    private double DegreesToRadians(double degrees) => degrees * Math.PI / 180.0;

    /// <summary>
    /// Helper to convert radians to degrees.
    /// </summary>
    private double RadiansToDegrees(double radians) => radians * 180.0 / Math.PI;

    public List<string> ConvertTrajectoryToJson(List<TrajectoryPoint> trajectoryPoints)
    {
        List<string> jsonStrings = trajectoryPoints
            .Select(point => JsonSerializer.Serialize(point, new JsonSerializerOptions { WriteIndented = false }))
            .ToList();

        return jsonStrings;
    }
}