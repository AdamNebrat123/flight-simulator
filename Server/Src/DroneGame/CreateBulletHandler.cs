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
	public void HandleCreateBullet(JsonElement data)
	{
		try
		{
			CreateBullet createBullet = data.Deserialize<CreateBullet>();
			if (createBullet == null)
				throw new Exception("Deserialization returned null");

			// Calculate trajectory points
			var points = CalculateBulletTrajectory(createBullet);

			// Add to BulletStore
			var bulletStore = DroneGame.BulletStore.GetInstance();
			bulletStore.AddBullet(createBullet.bulletId, points);

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
		double interval = 1.0 / fps;
		int totalFrames = 30; // 1 second of flight for example

		double startLat = createBullet.startPosition.latitude;
		double startLon = createBullet.startPosition.longitude;
		double startAlt = createBullet.startPosition.altitude;
		double endLat = createBullet.endPosition.latitude;
		double endLon = createBullet.endPosition.longitude;
		double endAlt = createBullet.endPosition.altitude;

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
}
