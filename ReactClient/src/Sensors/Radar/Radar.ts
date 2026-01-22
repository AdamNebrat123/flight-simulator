import type { Sensor } from "../Sensor";
import type { SensorType } from "../SensorRelaterEnums";

export interface Radar extends Sensor {
    sensorType: SensorType.Radar; 
}