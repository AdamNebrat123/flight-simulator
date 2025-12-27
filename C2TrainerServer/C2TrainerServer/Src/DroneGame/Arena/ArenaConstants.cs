// Arena constants

namespace DroneGame.Arena {
	public static class ArenaConstants {
		// Arena polygon points: [lon, lat, lon, lat, ...]
		public static readonly double[] ARENA_POLYGON_POINTS = new double[] {
			34.78925049809278, 32.02204305530594,
			34.773000130844494, 32.029514534494396,
			34.78495637449314, 32.0462830400265,
			34.80101758894347, 32.03863065352022
		};

		public const double ARENA_BOTTOM_HEIGHT = 0;
		public const double ARENA_UPPER_HEIGHT = 1000;
	}
}
