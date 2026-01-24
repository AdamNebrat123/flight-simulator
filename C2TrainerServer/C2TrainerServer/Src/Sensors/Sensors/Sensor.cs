using System.Text.Json.Serialization;



[JsonPolymorphic(TypeDiscriminatorPropertyName = "sensorType")]
[JsonDerivedType(typeof(Jammer), "Jammer")]
[JsonDerivedType(typeof(Radar), "Radar")]
public class Sensor
{
    [JsonIgnore]
    public SensorType sensorType { get; set; }
    
    [JsonPropertyName("id")]

    public string id { get; set; }
    [JsonPropertyName("position")]

    public GeoPoint position { get;  set;}
    [JsonPropertyName("status")]

    public Status status { get;  set; }

}