import * as Cesium from "cesium";

export interface DroneWithControls extends Cesium.Entity {
    handleKeyStateChange: (key: string, isPressed: boolean) => void;
}