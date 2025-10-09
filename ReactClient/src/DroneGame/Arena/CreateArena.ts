import * as Cesium from "cesium";
import { ARENA_BOTTOM_HEIGHT, ARENA_POLYGON_POINTS, ARENA_UPPER_HEIGHT } from "./ArenaConstants";

/**
 * Adds a Danger Zone polygon entity to the given Cesium viewer.
 * @param viewer Cesium.Viewer instance
 * @returns The created Cesium.Entity
 */
export function CreateArena(viewer: Cesium.Viewer): Cesium.Entity {
	const entity = viewer.entities.add({
		name: "arena",
		polygon: {
			hierarchy: Cesium.Cartesian3.fromDegreesArray(ARENA_POLYGON_POINTS),
			perPositionHeight: true,
			height: ARENA_BOTTOM_HEIGHT,
			extrudedHeight: ARENA_UPPER_HEIGHT,
			material: Cesium.Color.WHITE.withAlpha(0.7),
			outline: true,
			outlineColor: Cesium.Color.RED
		}
	});
	return entity;
}
