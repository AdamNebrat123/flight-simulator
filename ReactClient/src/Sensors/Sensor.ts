import type { GeoPoint } from "../Messages/AllTypes";
import type { SensorType, Status } from "./SensorRelaterEnums";

export interface Sensor {
    id: string;
    position: GeoPoint;
    status: Status;
    sensorType: SensorType;
}

