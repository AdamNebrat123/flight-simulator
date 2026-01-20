using System;
using System.Collections.Concurrent;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

public class DroneFallManager
{
    /*
    private readonly ScenarioResults scenario;
    private readonly ScenarioResults? scenarioCopy = null;
    private readonly double timeStepSeconds;
    private const double fallDelaySeconds = 5.0;
    private readonly ConcurrentDictionary<string, double> activeDroneTimers = new();
    private CancellationTokenSource cancellationTokenSource;
    private Task loopTask;

    public DroneFallManager(ScenarioResults scenario, ScenarioResults? scenarioResultsCopy)
    {
        this.scenario = scenario;
        this.scenarioCopy = scenarioResultsCopy;
        this.timeStepSeconds = PlaySelectedScenarioHandler.timeStepSeconds;
        StartLoop();
    }

    public void UpdateDroneCoverage(string droneId, bool isCovered)
{
    if (isCovered)
    {
        activeDroneTimers.TryAdd(droneId, 0.0);
    }
    else
    {
        activeDroneTimers.TryRemove(droneId, out _);
    }
}

    private void StartLoop()
{
    cancellationTokenSource = new CancellationTokenSource();
    var token = cancellationTokenSource.Token;

    loopTask = Task.Run(async () =>
    {
        while (!token.IsCancellationRequested)
        {
            
            if (scenario.isPaused)
            {
                await Task.Delay(100, token);
                continue;
            }
            double deltaSimSeconds =
                timeStepSeconds * scenario.playSpeed;

            foreach (var droneId in activeDroneTimers.Keys.ToList())
            {
                activeDroneTimers.AddOrUpdate(
                    droneId,
                    deltaSimSeconds,
                    (_, current) => current + deltaSimSeconds
                );

                if (activeDroneTimers[droneId] >= fallDelaySeconds)
                {
                    StartDroneFall(droneId);
                    activeDroneTimers.TryRemove(droneId, out _);
                }
            }

            await Task.Delay((int)(timeStepSeconds * 1000), token);
        }
    }, token);
}

    public void StopLoop()
    {
        cancellationTokenSource?.Cancel();
        loopTask = null;
    }

    private void StartDroneFall(string droneId)
    {
        System.Console.WriteLine("StartDroneFall");
        AircraftRuntimeData droneRuntimeData = scenarioCopy.Aircrafts[droneId];
        if (droneRuntimeData == null || droneRuntimeData.Trajectory.Count == 0){
            return;
        }
        System.Console.WriteLine("points: " + droneRuntimeData.Trajectory.Count);
        TrajectoryPoint trajectoryPoint = droneRuntimeData.Trajectory.Peek();
        if (trajectoryPoint == null){
            return;
        }
        System.Console.WriteLine(trajectoryPoint);


        //double velocity = droneRuntimeData.Aircraft.velocity;
        GeoPoint startPosition = trajectoryPoint.position;
        GeoPoint endPosition = new GeoPoint(startPosition.longitude, startPosition.latitude, 0);
        Queue<TrajectoryPoint> queuePoints = ComputeTrajectory(startPosition, endPosition, 100, timeStepSeconds);


        //discard heading pitch roll
        double heading = trajectoryPoint.heading;
        double pitch = trajectoryPoint.pitch;
        double roll = trajectoryPoint.roll;
        foreach (TrajectoryPoint point in queuePoints)
        {
            point.heading = heading;
            point.pitch = pitch;
            point.roll = roll;
        }
        droneRuntimeData.Trajectory = queuePoints;
        System.Console.WriteLine("Drone fell.");
    }
    
    public static Queue<TrajectoryPoint> ComputeTrajectory(
    GeoPoint start,
    GeoPoint end,
    double velocityMetersPerSecond,
    double timeStepSeconds)
    {
        var queue = new Queue<TrajectoryPoint>();

        // המר הפרשי lat/lon למטרים (קירוב מקומי)
        const double metersPerDegreeLat = 111_320.0;
        double metersPerDegreeLon = metersPerDegreeLat * Math.Cos(start.latitude * Math.PI / 180.0);

        double dxMeters = (end.longitude - start.longitude) * metersPerDegreeLon;
        double dyMeters = (end.latitude - start.latitude) * metersPerDegreeLat;
        double dzMeters = end.altitude - start.altitude;

        double distanceMeters = Math.Sqrt(dxMeters * dxMeters + dyMeters * dyMeters + dzMeters * dzMeters);

        if (distanceMeters <= 0 || velocityMetersPerSecond <= 0 || timeStepSeconds <= 0)
            return queue;

        double totalTime = distanceMeters / velocityMetersPerSecond;

        double dirX = dxMeters / distanceMeters;
        double dirY = dyMeters / distanceMeters;
        double dirZ = dzMeters / distanceMeters;

        double elapsed = 0;

        while (elapsed <= totalTime)
        {
            double traveled = velocityMetersPerSecond * elapsed;

            double x = traveled * dirX;
            double y = traveled * dirY;
            double z = traveled * dirZ;

            double lon = start.longitude + x / metersPerDegreeLon;
            double lat = start.latitude + y / metersPerDegreeLat;
            double alt = start.altitude + z;

            queue.Enqueue(
                new TrajectoryPoint(
                    new GeoPoint(lon, lat, alt),
                    0,
                    0
                )
            );

            elapsed += timeStepSeconds;
        }

        // ודא נקודת סיום מדויקת
        queue.Enqueue(new TrajectoryPoint(new GeoPoint(end.longitude, end.latitude, end.altitude),0,0));

        return queue;
    }
 */
}
