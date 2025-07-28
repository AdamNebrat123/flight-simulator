using System.Text.Json;
using System.Text.Json.Serialization;
public class MessageWrapper
{
    public string Type { get; set; }
    public JsonElement Data { get; set; }
}