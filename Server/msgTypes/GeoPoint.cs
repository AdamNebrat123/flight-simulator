using System.Text.Json.Serialization;

public class GeoPoint
{
    [JsonPropertyName("longitude")]
    public double Longitude { get; set; }

    [JsonPropertyName("latitude")]
    public double Latitude { get; set; }

    [JsonPropertyName("height")]
    public double Height { get; set; }

    public GeoPoint(double longitude, double latitude, double height)
    {
        Longitude = longitude;
        Latitude = latitude;
        Height = height;
    }

    
    public override string ToString()
    {
        return $"Selected Point [Lon={Longitude}, Lat={Latitude}, Height={Height}]";
    }
}