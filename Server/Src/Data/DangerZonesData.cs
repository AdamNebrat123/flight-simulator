using System.Text.Json.Serialization;

public class DangerZonesData
{
    [JsonPropertyName("dataType")]
    public DataTypes dataType { get; } = DataTypes.DangerZonesData;

    [JsonPropertyName("data")]
    public List<DangerZone> data { get; set; } = new();
}