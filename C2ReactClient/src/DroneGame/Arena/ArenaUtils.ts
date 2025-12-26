import { ARENA_POLYGON_POINTS } from "./ArenaConstants";
import * as Cesium from "cesium";

/**
 * Generates a random position inside the arena polygon.
 * Height is between 50 and 150.
 * @returns Cesium.Cartesian3 position
 */
export function getRandomArenaPosition(): Cesium.Cartesian3 {
	// Convert ARENA_POLYGON_POINTS to array of [lon, lat]
	const points: [number, number][] = [];
	for (let i = 0; i < ARENA_POLYGON_POINTS.length; i += 2) {
		points.push([ARENA_POLYGON_POINTS[i], ARENA_POLYGON_POINTS[i + 1]]);
	}

	// Find bounding box
	const lons = points.map(p => p[0]);
	const lats = points.map(p => p[1]);
	const minLon = Math.min(...lons);
	const maxLon = Math.max(...lons);
	const minLat = Math.min(...lats);
	const maxLat = Math.max(...lats);

	// Helper: point-in-polygon test (ray-casting algorithm)
	function isInsidePolygon(lon: number, lat: number): boolean {
		let inside = false;
		for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
			const xi = points[i][0], yi = points[i][1];
			const xj = points[j][0], yj = points[j][1];
			const intersect = ((yi > lat) !== (yj > lat)) &&
				(lon < (xj - xi) * (lat - yi) / (yj - yi + 1e-12) + xi);
			if (intersect) inside = !inside;
		}
		return inside;
	}

	// Try random points until one is inside polygon
	let lon, lat;
	let attempts = 0;
	do {
		lon = Math.random() * (maxLon - minLon) + minLon;
		lat = Math.random() * (maxLat - minLat) + minLat;
		attempts++;
		if (attempts > 1000) throw new Error("Could not find random point inside arena polygon");
	} while (!isInsidePolygon(lon, lat));

	// Fixed height of 50
	const height = 50;

	// Convert to Cesium.Cartesian3
	return Cesium.Cartesian3.fromDegrees(lon, lat, height);
}
