// Utility functions for drone visibility and respawn logic
import * as Cesium from "cesium";

export function setDroneToDefaultPositionAndOrientation(drone: Cesium.Entity) {
    if (!drone) return;
    const defaultPos = Cesium.Cartesian3.fromDegrees(34.78217676812864, 32.02684069644974, 160);
    const defaultHpr = new Cesium.HeadingPitchRoll(
        Cesium.Math.toRadians(0),
        Cesium.Math.toRadians(0),
        0
    );
    const orientation = Cesium.Transforms.headingPitchRollQuaternion(defaultPos, defaultHpr);
    drone.position = new Cesium.ConstantPositionProperty(defaultPos);
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
