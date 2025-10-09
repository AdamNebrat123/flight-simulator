// Utility functions for drone visibility and respawn logic
import * as Cesium from "cesium";
import { getRandomArenaPosition } from "../../Arena/ArenaUtils";

// Sets the position and orientation of the given drone entity to a random location within the arena.
//The drone's position is set using a randomly generated position from `getRandomArenaPosition()`.
export function setDronePositionAndOrientation(drone: Cesium.Entity) {
    if (!drone) return;
    const randomPositionInArena = getRandomArenaPosition();
    const defaultHpr = new Cesium.HeadingPitchRoll(
        Cesium.Math.toRadians(0),
        Cesium.Math.toRadians(0),
        0
    );
    const orientation = Cesium.Transforms.headingPitchRollQuaternion(randomPositionInArena, defaultHpr);
    drone.position = new Cesium.ConstantPositionProperty(randomPositionInArena);
    drone.orientation = new Cesium.ConstantProperty(orientation);
}

export function setDroneShow(drone: Cesium.Entity, show: boolean) {
    if (drone) {
        drone.show = show;
    }
}

export function hideDrone(drone: Cesium.Entity) {
    setDroneShow(drone, false);
}

export function showDrone(drone: Cesium.Entity) {
    setDroneShow(drone, true);
}
