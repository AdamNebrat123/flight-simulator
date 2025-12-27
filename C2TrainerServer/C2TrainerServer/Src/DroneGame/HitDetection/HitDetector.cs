using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace DroneGame.HitDetection
{
	public class HitDetector
	{
		private static HitDetector instance = new HitDetector();
        private BulletStore bulletStore = BulletStore.GetInstance();
		private double hitDistance = 15.0; // meters, adjustable

		private HitDetector() { }

		public static HitDetector GetInstance()
		{
			return instance;
		}

		// Checks for hits for a specific drone and returns the first bulletId that hits it, or null if none
		public string? CheckHit(Drone drone)
		{
			var allBullets = this.bulletStore.GetAllBullets();

			foreach (var bulletKvp in allBullets)
			{
				string bulletId = bulletKvp.Key;
				var bulletPoints = bulletKvp.Value;
				if (bulletPoints == null || bulletPoints.Count == 0)
					continue;

				// Check only the first item in the linked list
				var firstBulletData = bulletPoints.First?.Value;
				if (firstBulletData == null)
					continue;

				// Skip bullets fired by the current drone
				if (firstBulletData.droneId == drone.id)
					continue;

				double dist = CalculateDistance(drone.trajectoryPoint.position, firstBulletData.position);
				if (dist <= hitDistance)
				{
					Console.WriteLine($"[HitDetector] Hit detected: bulletId={bulletId}, droneId={drone.id}, dist={dist}");
					return bulletId;
				}
			}
			return null;
		}

		// Calculates 3D distance between two GeoPoints
		private double CalculateDistance(GeoPoint a, GeoPoint b)
		{
			double lat1 = DegreesToRadians(a.latitude);
			double lon1 = DegreesToRadians(a.longitude);
			double lat2 = DegreesToRadians(b.latitude);
			double lon2 = DegreesToRadians(b.longitude);
			double dLat = lat2 - lat1;
			double dLon = lon2 - lon1;
			double R = 6371000.0;
			double aHav = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
						  Math.Cos(lat1) * Math.Cos(lat2) *
						  Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
			double c = 2 * Math.Atan2(Math.Sqrt(aHav), Math.Sqrt(1 - aHav));
			double horizontalDist = R * c;
			double verticalDist = b.altitude - a.altitude;
			return Math.Sqrt(horizontalDist * horizontalDist + verticalDist * verticalDist);
		}

		private double DegreesToRadians(double degrees)
		{
			return degrees * Math.PI / 180.0;
		}
	}
}
