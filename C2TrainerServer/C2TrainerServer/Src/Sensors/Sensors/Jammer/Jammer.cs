
using System.Text.Json.Serialization;

public class Jammer : Sensor, ISetJammingMode
{

    [JsonPropertyName("jamMode")]
    public JamMode jamMode { get;  set; }
    [JsonPropertyName("supportedFrequencies")]
    public List<Frequency> supportedFrequencies { get; set;}
    [JsonPropertyName("radius")]
    public double radius { get; set;}
    [JsonPropertyName("directionDegrees")]
    public double? directionDegrees { get; set; } // for directional jamming

    public Jammer()
    {
        sensorType = SensorType.Jammer;
    }
    public Jammer(string id, GeoPoint position,double radius, List<Frequency> supportedFrequencies)
    {
        this.id = id;
        this.position = position;
        this.radius = radius;
        this.supportedFrequencies = supportedFrequencies;

        status = Status.Online;
        jamMode = JamMode.None;
    }

    public void StartDirectionalJamming(double directionDegrees)
    {
        this.directionDegrees = directionDegrees;
        jamMode = JamMode.Directional;
    }

    public void StartOmnidirectionalJamming()
    {
        this.directionDegrees = 0;
        jamMode = JamMode.Omnidirectional;
    }

    public void StopJamming()
    {
        this.directionDegrees = 0;
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
        return distance <= radius;
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