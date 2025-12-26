using System.Text.Json.Serialization;

public class JammersData
{
    [JsonPropertyName("dataType")]
    public DataTypes dataType { get; } = DataTypes.JammersData;

    [JsonPropertyName("data")]
    public List<Jammer> data { get; set; } = new();
}