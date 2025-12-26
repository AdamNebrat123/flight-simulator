using System.Text.Json;
public class TrajectoryCalculator
{
    // Earth's mean radius in meters (used for converting geo coords to Cartesian)
    private const double EarthRadius = 6371000;

    /// <summary>
    /// Computes the linear trajectory points between start and end GeoPoints,
    /// given a constant velocity (m/s). Each returned point corresponds to
    /// the position after each timeStepSeconds.
    /// </summary>
    public List<TrajectoryPoint> ComputeTrajectory(GeoPoint start, GeoPoint end, double velocityMetersPerSecond, double timeStepSeconds)
    {
        // 1. Convert start/end to Cartesian
        var startCart = GeoToCartesian(start);
        var endCart   = GeoToCartesian(end);

        // 2. Compute total distance and total time (double)
        double dx       = endCart.X - startCart.X;
        double dy       = endCart.Y - startCart.Y;
        double dz       = endCart.Z - startCart.Z;
        double distance = Math.Sqrt(dx*dx + dy*dy + dz*dz);
        double totalTime = distance / velocityMetersPerSecond;

        var result = new List<TrajectoryPoint>();
        
        // 3. Step through t = 0, timeStep, 2*timeStep, …, up to totalTime
        for (double t = 0.0; t < totalTime; t += timeStepSeconds)
        {
            double alpha = t / totalTime; // fraction along path

            double x = startCart.X + alpha * dx;
            double y = startCart.Y + alpha * dy;
            double z = startCart.Z + alpha * dz;

            GeoPoint geoPoint = CartesianToGeo(x, y, z);

            // compute heading/pitch toward the next instant
            double nextT = Math.Min(t + timeStepSeconds, totalTime);
            double alpha2 = nextT / totalTime;
            double x2 = startCart.X + alpha2 * dx;
            double y2 = startCart.Y + alpha2 * dy;
            double z2 = startCart.Z + alpha2 * dz;

            (double heading, double pitch) = CalculateHeadingAndPitch(x, y, z, x2, y2, z2);

            result.Add(new TrajectoryPoint(geoPoint, heading, pitch));
        }

        // 4. Ensure exact end point is included
        {
            GeoPoint geoPoint = end;
            // last heading/pitch can be zero or repeat previous
            result.Add(new TrajectoryPoint(geoPoint, 0.0, 0.0));
        }

        return result;
    }

    /// <summary>
    /// Converts geographic coordinates (latitude, longitude, height) to
    /// Earth-Centered Earth-Fixed (ECEF) Cartesian coordinates (X, Y, Z).
    /// </summary>
    private (double X, double Y, double Z) GeoToCartesian(GeoPoint point)
    {
        double latRad = DegreesToRadians(point.latitude);
        double lonRad = DegreesToRadians(point.longitude);
        double radius = EarthRadius + point.altitude;

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
            altitude: height
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
        // Convert start point to geodetic
        var startGeo = CartesianToGeo(x1, y1, z1);
        
        // Compute local ENU vector from start to end
        double latRad = DegreesToRadians(startGeo.latitude);
        double lonRad = DegreesToRadians(startGeo.longitude);

        // ECEF differences
        double dx = x2 - x1;
        double dy = y2 - y1;
        double dz = z2 - z1;

        // ENU transformation
        double east  = -Math.Sin(lonRad) * dx + Math.Cos(lonRad) * dy;
        double north = -Math.Sin(latRad) * Math.Cos(lonRad) * dx - Math.Sin(latRad) * Math.Sin(lonRad) * dy + Math.Cos(latRad) * dz;
        double up    =  Math.Cos(latRad) * Math.Cos(lonRad) * dx + Math.Cos(latRad) * Math.Sin(lonRad) * dy + Math.Sin(latRad) * dz;

        // Compute heading (clockwise from North)
        double headingRad = Math.Atan2(east, north);
        double headingDeg = (RadiansToDegrees(headingRad) + 360) % 360;

        // Compute pitch (angle above horizontal)
        double horizontalDist = Math.Sqrt(east * east + north * north);
        double pitchRad = Math.Atan2(up, horizontalDist);
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
}