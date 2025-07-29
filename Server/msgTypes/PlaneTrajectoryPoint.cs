using System.Text.Json.Serialization;


public class PlaneTrajectoryPoint
{
    [JsonPropertyName("position")]
    public GeoPoint Position { get; set; }
    [JsonPropertyName("name")]
    public string Name { get; set; }

    public PlaneTrajectoryPoint(GeoPoint position, string name)
    {
        Position = position;
        Name = name;
    }
    public override string ToString()
    {
        return string.Format("{0}, Name: {1}", Position, Name);
    }
}