using System.Text.Json.Serialization;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum JamMode
{
    None,
    Directional,
    Omnidirectional
}
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum Frequency
{
    Rc_24GHz,
    Rc_58GHz,
    GNSS_L1,
    GNSS_L2
}