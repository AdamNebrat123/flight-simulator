using System;
using System.Collections.Generic;

using System.Text.Json;
using System.Text.Json.Serialization;
using System.Globalization;

public partial class AllTypes
{
    [JsonPropertyName("geoPoint")]
    public GeoPoint geoPoint { get; set; }

    [JsonPropertyName("messageWrapper")]
    public MessageWrapper messageWrapper { get; set; }

    [JsonPropertyName("multiPlaneTrajectoryResult")]
    public MultiPlaneTrajectoryResult multiPlaneTrajectoryResult { get; set; }

    [JsonPropertyName("planeCalculatedTrajectoryPoints")]
    public PlaneCalculatedTrajectoryPoints planeCalculatedTrajectoryPoints { get; set; }

    [JsonPropertyName("planesTrajectoryPointsEvent")]
    public PlanesTrajectoryPointsEvent planesTrajectoryPointsEvent { get; set; }

    [JsonPropertyName("planeTrajectoryPoints")]
    public PlaneTrajectoryPoints planeTrajectoryPoints { get; set; }

    [JsonPropertyName("trajectoryPoint")]
    public TrajectoryPoint trajectoryPoint { get; set; }
}

public partial class GeoPoint
{
    [JsonPropertyName("altitude")]
    public double altitude { get; set; }

    [JsonPropertyName("latitude")]
    public double latitude { get; set; }

    [JsonPropertyName("longitude")]
    public double longitude { get; set; }
    [JsonConstructor]
    public GeoPoint(double longitude, double latitude, double altitude)
    {
        this.longitude = longitude;
        this.latitude = latitude;
        this.altitude = altitude;
    }
    public override string ToString()
    {
        return $"Selected Point [Lon={longitude}, Lat={latitude}, Altitude={altitude}]";
    }
}

/// <summary>
/// Intermediate wrapper containing a type string and raw data to be deserialized based on
/// the type *****it will genterate data as Dictionary<string, object> Switch it to
/// JsonElement*****
/// </summary>
public partial class MessageWrapper
{
    /// <summary>
    /// The inner object, to be deserialized according to the 'Type'. No schema enforced here.
    /// </summary>
    [JsonPropertyName("data")]
    public JsonElement data { get; set; }

    /// <summary>
    /// The type of the inner message (used for dynamic deserialization)
    /// </summary>
    [JsonPropertyName("type")]
    public string type { get; set; }
}

public partial class MultiPlaneTrajectoryResult
{
    [JsonPropertyName("planes")]
    public List<PlaneCalculatedTrajectoryPoints> planes { get; set; }
    public MultiPlaneTrajectoryResult(List<PlaneCalculatedTrajectoryPoints> planes)
    {
        this.planes = planes;
    }
}

public partial class PlaneCalculatedTrajectoryPoints
{
    [JsonPropertyName("planeName")]
    public string planeName { get; set; }

    [JsonPropertyName("trajectoryPoints")]
    public List<TrajectoryPoint> trajectoryPoints { get; set; }
}

public partial class TrajectoryPoint
{
    [JsonPropertyName("heading")]
    public double heading { get; set; }

    [JsonPropertyName("pitch")]
    public double pitch { get; set; }

    [JsonPropertyName("position")]
    public GeoPoint position { get; set; }
    public TrajectoryPoint(GeoPoint position, double heading, double pitch)
    {
        this.position = position;
        this.heading = heading;
        this.pitch = pitch;
    }

    public override string ToString()
    {
        return string.Format("[{0},Heading={1},Pitch={2}]", position, heading, pitch);
    }
}

public partial class PlaneTrajectoryPoints
{
    [JsonPropertyName("geoPoints")]
    public List<GeoPoint> geoPoints { get; set; }

    [JsonPropertyName("planeName")]
    public string planeName { get; set; }

    [JsonPropertyName("velocity")]
    public double velocity { get; set; }
}

public partial class PlanesTrajectoryPointsEvent
{
    [JsonPropertyName("planes")]
    public List<PlaneTrajectoryPoints> planes { get; set; }
}
