using System.Text.Json.Serialization;


[JsonConverter(typeof(JsonStringEnumConverter))]
public enum SensorType
{
    Jammer,
    Radar
}
[JsonConverter(typeof(JsonStringEnumConverter))]

public enum Status
{
    Offline,
    Online,
    Critical
}