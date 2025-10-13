using System;
using System.Text.Json;
using System.Collections.Generic;

public class CreateBulletHandler
{
	private static CreateBulletHandler instance;

	private CreateBulletHandler() { }

	public static CreateBulletHandler GetInstance()
	{
		if (instance == null)
			instance = new CreateBulletHandler();
		return instance;
	}

	// Handles the CreateBullet message
	public void HandleCreateBullet(JsonElement data, ModeEnum clientMode)
	{
		try
		{
			CreateBullet createBullet = data.Deserialize<CreateBullet>();
            
            // Generate a new UUID for the bullet
            Guid uuid = Guid.NewGuid(); 
            string uuidString = uuid.ToString();
            createBullet.bulletId = uuidString;

			// Calculate trajectory points
			var points = CalculateBulletTrajectory(createBullet);

			// Add to BulletStore
			var bulletStore = DroneGame.BulletStore.GetInstance();
			bulletStore.AddBullet(createBullet.bulletId, points);
		}
        catch(NullReferenceException nre)
        {
            Console.WriteLine("Null reference in HandleCreateBullet: " + nre.Message);
        }
		catch (Exception ex)
        {
            Console.WriteLine("Error in HandleCreateBullet: " + ex.Message);
        }
	}

	// Calculates the bullet trajectory points (simple linear interpolation for now)
	public List<BulletData> CalculateBulletTrajectory(CreateBullet createBullet)
	{
		var points = new List<BulletData>();
		int fps = 30;
		double velocity = 500.0; // meters per second

		double startLat = createBullet.startPosition.latitude;
		double startLon = createBullet.startPosition.longitude;
		double startAlt = createBullet.startPosition.altitude;
		double endLat = createBullet.endPosition.latitude;
		double endLon = createBullet.endPosition.longitude;
		double endAlt = createBullet.endPosition.altitude;

		// Convert lat/lon to radians
		double lat1 = DegreesToRadians(startLat);
		double lon1 = DegreesToRadians(startLon);
		double lat2 = DegreesToRadians(endLat);
		double lon2 = DegreesToRadians(endLon);

		// Earth radius in meters
		double R = 6371000.0;
		// Haversine formula for horizontal distance
		double dLat = lat2 - lat1;
		double dLon = lon2 - lon1;
		double a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
				   Math.Cos(lat1) * Math.Cos(lat2) *
				   Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
		double c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
		double horizontalDist = R * c;
		double verticalDist = endAlt - startAlt;
		double totalDist = Math.Sqrt(horizontalDist * horizontalDist + verticalDist * verticalDist);

		double totalTime = totalDist / velocity; // seconds
		int totalFrames = Math.Max(1, (int)Math.Ceiling(totalTime * fps));

		for (int i = 0; i <= totalFrames; i++)
		{
			double t = (double)i / totalFrames;
			double lat = startLat + (endLat - startLat) * t;
			double lon = startLon + (endLon - startLon) * t;
			double alt = startAlt + (endAlt - startAlt) * t;

			var geoPoint = new GeoPoint(lon, lat, alt);
			var bulletData = new BulletData
			{
				droneId = createBullet.droneId,
				bulletId = createBullet.bulletId,
				position = geoPoint,
				isLast = (i == totalFrames)
			};
			points.Add(bulletData);
		}
		return points;

	}

	private double DegreesToRadians(double degrees)
	{
		return degrees * Math.PI / 180.0;
	}
}
