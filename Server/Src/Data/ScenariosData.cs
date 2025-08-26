using System.Text.Json.Serialization;

public class ScenariosData
{
    [JsonPropertyName("dataType")]
    public DataTypes dataType { get; } = DataTypes.ScenariosData;

    [JsonPropertyName("data")]
    public List<PlanesTrajectoryPointsScenario> data { get; set; } = new();
}