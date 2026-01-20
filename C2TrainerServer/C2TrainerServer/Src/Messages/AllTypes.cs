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
    public ScenarioAirCraftsSnapshot multiPlaneTrajectoryResult { get; set; }

    [JsonPropertyName("planeCalculatedTrajectoryPoints")]
    public AircraftStatus planeCalculatedTrajectoryPoints { get; set; }

    [JsonPropertyName("planesTrajectoryPointsEvent")]
    public Scenario planesTrajectoryPointsEvent { get; set; }

    [JsonPropertyName("planeTrajectoryPoints")]
    public AircraftTrajectory planeTrajectoryPoints { get; set; }

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
    public string? type { get; set; }

    /// <summary>
    /// The mode of the message (used for routing)
    /// </summary>
    [JsonPropertyName("clientMode")]
    public string? clientMode { get; set; }
}

public partial class ScenarioAirCraftsSnapshot
{
    [JsonPropertyName("scenarioId")]
    public string scenarioId { get; set; }

    [JsonPropertyName("aircrafts")]
    public List<AircraftStatus> aircrafts { get; set; }
    public ScenarioAirCraftsSnapshot(List<AircraftStatus> aircrafts)
    {
        this.aircrafts = aircrafts;
    }
}

public partial class RadarUpdate
{
     [JsonPropertyName("aircrafts")]
    public List<AircraftStatus> aircrafts { get; set; }
    public RadarUpdate(ScenarioAirCraftsSnapshot snapshot)
    {
        this.aircrafts = snapshot.aircrafts;
    }
}



public partial class TrajectoryPoint
{
    [JsonPropertyName("heading")]
    public double heading { get; set; }

    [JsonPropertyName("pitch")]
    public double pitch { get; set; }
    [JsonPropertyName("roll")]
    public double roll { get; set; }

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


public partial class Scenario
{
    [JsonPropertyName("scenarioId")]
    public string scenarioId { get; set; }
    [JsonPropertyName("aircrafts")]
    public List<AircraftTrajectory> aircrafts { get; set; }
    [JsonPropertyName("scenarioName")]
    public string scenarioName { get; set; }

    [JsonPropertyName("zones")]
    public List<Zone> zones;
    [JsonPropertyName("jammers")]
    public List<Sensor> jammers;
    [JsonPropertyName("radars")]
    public List<Sensor> radars;

}

public partial class PlaySelectedScenarioCmd
{
    [JsonPropertyName("scenarioId")]
    public string scenarioId { get; set; }
}

public partial class PauseScenarioCmd
{
    [JsonPropertyName("scenarioId")]
    public string scenarioId { get; set; }
}
public partial class ResumeScenarioCmd
{
    [JsonPropertyName("scenarioId")]
    public string scenarioId { get; set; }
}
public partial class ChangeScenarioPlaySpeedCmd
{
    [JsonPropertyName("scenarioId")]
    public string scenarioId { get; set; }
    [JsonPropertyName("playSpeed")]
    public double playSpeed { get; set; }
}

[JsonPolymorphic(TypeDiscriminatorPropertyName = "zoneType")]
[JsonDerivedType(typeof(DangerZone), "Danger")]
[JsonDerivedType(typeof(JamZone), "Jam")]
public abstract class Zone
{
    [JsonPropertyName("zoneId")]
    public string zoneId { get; set; }

    [JsonPropertyName("zoneName")]
    public string zoneName { get; set; }

    [JsonPropertyName("points")]
    public List<GeoPoint> points { get; set; }

    [JsonPropertyName("topHeight")]
    public double topHeight { get; set; }

    [JsonPropertyName("bottomHeight")]
    public double bottomHeight { get; set; }
    [JsonIgnore]
    public string zoneType { get; set; }
}
public class DangerZone : Zone
{
    public DangerZone()
    {
        zoneType = ZoneType.Danger.ToString();
    }
}
public class JamZone : Zone
{
    public List<string> jammersIds { get; set; }
    public JamZone()
    {
        zoneType = ZoneType.Jam.ToString();
        jammersIds = new List<string>();
    }
}


public partial class InitData
{
    [JsonPropertyName("scenarios")]
    public List<Scenario> scenarios { get; set; }

}

public partial class ScenarioError
{
    [JsonPropertyName("errorMsg")]
    public string errorMsg { get; set; }
}


public partial class Drone
{
    [JsonPropertyName("id")]
    public string id { get; set; }

    [JsonPropertyName("trajectoryPoint")]
    public TrajectoryPoint trajectoryPoint { get; set; }

    [JsonConstructor]
    public Drone(string id, TrajectoryPoint trajectoryPoint)
    {
        this.id = id;
        this.trajectoryPoint = trajectoryPoint;
    }

    public override string ToString()
    {
        return $"Drone [Id={id}, {trajectoryPoint}]";
    }


}

public partial class DronesInitData
{
    [JsonPropertyName("yourDroneId")]
    public string yourDroneId { get; set; }
}

public partial class CreateBullet
{
    [JsonPropertyName("droneId")]
    public string droneId { get; set; }

    [JsonPropertyName("bulletId")]
    public string bulletId { get; set; }

    [JsonPropertyName("startPosition")]
    public GeoPoint startPosition { get; set; }

    [JsonPropertyName("endPosition")]
    public GeoPoint endPosition { get; set; }
}

public partial class BulletData
{
    [JsonPropertyName("droneId")]
    public string droneId { get; set; }

    [JsonPropertyName("bulletId")]
    public string bulletId { get; set; }

    [JsonPropertyName("position")]
    public GeoPoint position { get; set; }

    [JsonPropertyName("isLast")]
    public bool isLast { get; set; }
}
public partial class BulletsMsg
{
    [JsonPropertyName("bullets")]
    public List<BulletData> bullets { get; set; }
}

public partial class DroneKilled
{
    [JsonPropertyName("killerDroneId")]
    public string killerDroneId { get; set; }
    [JsonPropertyName("killedDroneId")]
    public string killedDroneId { get; set; }
    [JsonPropertyName("bulletId")]
    public string bulletId { get; set; }

    public DroneKilled(string killerDroneId, string killedDroneId, string bulletId)
    {
        this.killerDroneId = killerDroneId;
        this.killedDroneId = killedDroneId;
        this.bulletId = bulletId;
    }
}


// Base trajectory

[JsonPolymorphic(TypeDiscriminatorPropertyName = "aircraftType")]
[JsonDerivedType(typeof(DroneTrajectory), "Drone")]
[JsonDerivedType(typeof(PlaneTrajectory), "Plane")]
[JsonDerivedType(typeof(BalloonTrajectory), "Balloon")]
[JsonDerivedType(typeof(B2spiritTrajectory), "B2spirit")]
[JsonDerivedType(typeof(F16Trajectory), "F16")]
[JsonDerivedType(typeof(F34Trajectory), "F35")]
[JsonDerivedType(typeof(IaiKfirTrajectory), "IaiKfir")]
[JsonDerivedType(typeof(UavTrajectory), "Uav")]
public partial class AircraftTrajectory
{
    //[JsonPropertyName("aircraftType")]
    //public string aircraftType { get; set; }
    [JsonPropertyName("aircraftId")]
    public string aircraftId { get; set; }

    [JsonPropertyName("geoPoints")]
    public List<GeoPoint> geoPoints { get; set; }

    [JsonPropertyName("aircraftName")]
    public string aircraftName { get; set; }

    [JsonPropertyName("velocity")]
    public double velocity { get; set; }

    public virtual AircraftStatus CreateStatus(TrajectoryPoint point)
    {
        return new AircraftStatus
        {
            aircraftType = "NONE",
            aircraftId = this.aircraftId,
            aircraftName = this.aircraftName,
            trajectoryPoints = new List<TrajectoryPoint> { point },
            tailPoints = new List<TrajectoryPoint>(),
            isInDangerZone = false,
            dangerZonesIn = new List<string>()
        };
    }
}

public partial class DroneTrajectory : AircraftTrajectory
{
    [JsonPropertyName("frequency")]
    public string frequency { get; set; }
    public override AircraftStatus CreateStatus(TrajectoryPoint point)
    {
        return new DroneStatus
        {
            aircraftType = AircraftTypeEnum.Drone.ToString(),
            aircraftId = this.aircraftId,
            aircraftName = this.aircraftName,
            trajectoryPoints = new List<TrajectoryPoint> { point },
            tailPoints = new List<TrajectoryPoint>(),
            isInDangerZone = false,
            dangerZonesIn = new List<string>(),
            frequency = this.frequency
        };
    }
}

public partial class PlaneTrajectory : AircraftTrajectory
{
    public override AircraftStatus CreateStatus(TrajectoryPoint point)
    {
        return new PlaneStatus
        {
            aircraftType = AircraftTypeEnum.Plane.ToString(),
            aircraftId = this.aircraftId,
            aircraftName = this.aircraftName,
            trajectoryPoints = new List<TrajectoryPoint> { point },
            tailPoints = new List<TrajectoryPoint>(),
            isInDangerZone = false,
            dangerZonesIn = new List<string>()
        };
    }
}

public partial class BalloonTrajectory : AircraftTrajectory
{
    public override AircraftStatus CreateStatus(TrajectoryPoint point)
    {
        return new BalloonStatus
        {
            aircraftType = AircraftTypeEnum.Balloon.ToString(),
            aircraftId = this.aircraftId,
            aircraftName = this.aircraftName,
            trajectoryPoints = new List<TrajectoryPoint> { point },
            tailPoints = new List<TrajectoryPoint>(),
            isInDangerZone = false,
            dangerZonesIn = new List<string>()
        };
    }
}

public partial class B2spiritTrajectory : AircraftTrajectory
{
    public override AircraftStatus CreateStatus(TrajectoryPoint point)
    {
        return new B2spiritStatus
        {
            aircraftType = AircraftTypeEnum.B2spirit.ToString(),
            aircraftId = this.aircraftId,
            aircraftName = this.aircraftName,
            trajectoryPoints = new List<TrajectoryPoint> { point },
            tailPoints = new List<TrajectoryPoint>(),
            isInDangerZone = false,
            dangerZonesIn = new List<string>()
        };
    }
}

public partial class F16Trajectory : AircraftTrajectory
{
    public override AircraftStatus CreateStatus(TrajectoryPoint point)
    {
        return new F16Status
        {
            aircraftType = AircraftTypeEnum.F16.ToString(),
            aircraftId = this.aircraftId,
            aircraftName = this.aircraftName,
            trajectoryPoints = new List<TrajectoryPoint> { point },
            tailPoints = new List<TrajectoryPoint>(),
            isInDangerZone = false,
            dangerZonesIn = new List<string>()
        };
    }
}

public partial class F34Trajectory : AircraftTrajectory
{
    public override AircraftStatus CreateStatus(TrajectoryPoint point)
    {
        return new F34Status
        {
            aircraftType = AircraftTypeEnum.F35.ToString(),
            aircraftId = this.aircraftId,
            aircraftName = this.aircraftName,
            trajectoryPoints = new List<TrajectoryPoint> { point },
            tailPoints = new List<TrajectoryPoint>(),
            isInDangerZone = false,
            dangerZonesIn = new List<string>()
        };
    }
}

public partial class IaiKfirTrajectory : AircraftTrajectory
{
    public override AircraftStatus CreateStatus(TrajectoryPoint point)
    {
        return new IaiKfirStatus
        {
            aircraftType = AircraftTypeEnum.IaiKfir.ToString(),
            aircraftId = this.aircraftId,
            aircraftName = this.aircraftName,
            trajectoryPoints = new List<TrajectoryPoint> { point },
            tailPoints = new List<TrajectoryPoint>(),
            isInDangerZone = false,
            dangerZonesIn = new List<string>()
        };
    }
}

public partial class UavTrajectory : AircraftTrajectory
{
    public override AircraftStatus CreateStatus(TrajectoryPoint point)
    {
        return new UavStatus
        {
            aircraftType = AircraftTypeEnum.Uav.ToString(),
            aircraftId = this.aircraftId,
            aircraftName = this.aircraftName,
            trajectoryPoints = new List<TrajectoryPoint> { point },
            tailPoints = new List<TrajectoryPoint>(),
            isInDangerZone = false,
            dangerZonesIn = new List<string>()
        };
    }
}

// Base status
public partial class AircraftStatus
{
    [JsonPropertyName("aircraftType")]
    public string aircraftType { get; set; }
    [JsonPropertyName("aircraftId")]
    public string aircraftId { get; set; }

    [JsonPropertyName("aircraftName")]
    public string aircraftName { get; set; }

    [JsonPropertyName("trajectoryPoints")]
    public List<TrajectoryPoint> trajectoryPoints { get; set; } // it is actually one point everytime. not list. its a list because it needed to be used sometime a list in server side.
    [JsonPropertyName("tailPoints")]
    public List<TrajectoryPoint> tailPoints { get; set; }
    [JsonPropertyName("isInDangerZone")]
    public bool isInDangerZone { get; set; }
    [JsonPropertyName("dangerZonesIn")]
    public List<string> dangerZonesIn { get; set; }
}

public partial class DroneStatus : AircraftStatus
{
    public string frequency { get; set; }
    public DroneStatus() => aircraftType = AircraftTypeEnum.Drone.ToString();
}

public partial class PlaneStatus : AircraftStatus
{
    public PlaneStatus() => aircraftType = AircraftTypeEnum.Plane.ToString();
}

public partial class BalloonStatus : AircraftStatus
{
    public BalloonStatus() => aircraftType = AircraftTypeEnum.Balloon.ToString();
}

public partial class B2spiritStatus : AircraftStatus
{
    public B2spiritStatus() => aircraftType = AircraftTypeEnum.B2spirit.ToString();
}

public partial class F16Status : AircraftStatus
{
    public F16Status() => aircraftType = AircraftTypeEnum.F16.ToString();
}

public partial class F34Status : AircraftStatus
{
    public F34Status() => aircraftType = AircraftTypeEnum.F35.ToString();
}

public partial class IaiKfirStatus : AircraftStatus
{
    public IaiKfirStatus() => aircraftType = AircraftTypeEnum.IaiKfir.ToString();
}

public partial class UavStatus : AircraftStatus
{
    public UavStatus() => aircraftType = AircraftTypeEnum.Uav.ToString();
}

public partial class JammersUpdate
{
    [JsonPropertyName("jammers")]
    public List<Jammer> jammers { get; set; }
}

