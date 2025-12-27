using System.Text.Json.Serialization;

public class ZonesData
{
    [JsonPropertyName("dataType")]
    public DataTypes dataType { get; } = DataTypes.ZonesData;

    [JsonPropertyName("data")]
    public List<Zone> data { get; set; } = new();
}