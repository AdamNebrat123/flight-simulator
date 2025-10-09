using System;

namespace DroneGame.Arena {
    public class ArenaBoundaryChecker {
        // Singleton instance (not lazy)
        private static readonly ArenaBoundaryChecker instance = new ArenaBoundaryChecker();

        private readonly double[][] polygonPoints;

        private ArenaBoundaryChecker() {
            // Convert ARENA_POLYGON_POINTS to array of [lon, lat]
            var pts = ArenaConstants.ARENA_POLYGON_POINTS;
            polygonPoints = new double[pts.Length / 2][];
            for (int i = 0; i < pts.Length; i += 2) {
                polygonPoints[i / 2] = new double[] { pts[i], pts[i + 1] };
            }
        }
        
        public static ArenaBoundaryChecker GetInstance() {
            return instance;
        }

        // Ray-casting algorithm for point-in-polygon
        public bool IsPointInsideArena(GeoPoint point)
        {
            double lon = point.longitude;
            double lat = point.latitude;
            double alt = point.altitude;
            bool inside = false;
            int n = polygonPoints.Length;
            for (int i = 0, j = n - 1; i < n; j = i++)
            {
                double xi = polygonPoints[i][0], yi = polygonPoints[i][1];
                double xj = polygonPoints[j][0], yj = polygonPoints[j][1];
                bool intersect = ((yi > lat) != (yj > lat)) &&
                    (lon < (xj - xi) * (lat - yi) / ((yj - yi) == 0 ? 1e-12 : (yj - yi)) + xi);
                if (intersect) inside = !inside;
            }
            // Check height boundaries
            bool heightOk = alt >= ArenaConstants.ARENA_BOTTOM_HEIGHT && alt <= ArenaConstants.ARENA_UPPER_HEIGHT;
            return inside && heightOk;
        }
    }
}
