
public class Jammer : ISetJammingMode
{
    public string id { get; set; }
    public GeoPoint position { get;  set;}
    public Status status { get;  set; }
    public JamMode jamMode { get;  set; }

    public List<Frequency> supportedFrequencies { get; set;}
    public double Radius { get; set;}

    public double? DirectionDegrees { get; set; } // for directional jamming

    public Jammer()
    {
        
    }
    public Jammer(string id, GeoPoint position,double radius, List<Frequency> supportedFrequencies)
    {
        this.id = id;
        this.position = position;
        Radius = radius;
        this.supportedFrequencies = supportedFrequencies;

        status = Status.Online;
        jamMode = JamMode.None;
    }

    public void StartDirectionalJamming(double directionDegrees)
    {
        jamMode = JamMode.Directional;
    }

    public void StartOmnidirectionalJamming()
    {
        jamMode = JamMode.Omnidirectional;
    }

    public void StopJamming()
    {
        jamMode = JamMode.None;
    }

    public bool HasJamFrequency(string frequency)
    {
        if(Enum.TryParse(frequency, out Frequency freq))
            return supportedFrequencies.Contains(freq);
        return false;
    }


    public bool IsInJammerRange(GeoPoint targetPosition)
    {
        double distance = GetDistance(targetPosition);
        return distance <= Radius;
    }
    public double GetDistance(GeoPoint targetPosition)
    {
        const double EarthRadiusMeters = 6371000;

        double lat1 = DegreesToRadians(position.latitude);
        double lon1 = DegreesToRadians(position.longitude);

        double lat2 = DegreesToRadians(targetPosition.latitude);
        double lon2 = DegreesToRadians(targetPosition.longitude);

        double dLat = lat2 - lat1;
        double dLon = lon2 - lon1;

        double a =
            Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
            Math.Cos(lat1) * Math.Cos(lat2) *
            Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

        double c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        double distanceMeters = EarthRadiusMeters * c;

        // פה תחליט מה הקריטריון שלך
        return distanceMeters; // למשל: עד קילומטר
    }

    private static double DegreesToRadians(double degrees)
    {
        return degrees * Math.PI / 180.0;
    }
}