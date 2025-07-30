using System.Text.Json.Serialization;

public class GeoPoint
{
    [JsonPropertyName("longitude")]
    public double longitude { get; set; }

    [JsonPropertyName("latitude")]
    public double latitude { get; set; }

    [JsonPropertyName("altitude")]
    public double altitude { get; set; }

    [JsonConstructor]
    public GeoPoint(double longitude, double latitude, double altitude)
    {
        this.longitude = longitude;
        this.latitude = latitude;
        this.altitude = altitude;
    }
    public override string ToString()
    {
        return $"Selected Point [Lon={longitude}, Lat={latitude}, Altitude={altitude}]";
    }
}
