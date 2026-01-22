import type { GeoPoint } from "../../Messages/AllTypes";
import type { Frequency, JamMode, Status } from "./JammerRelatedEnums";

export interface Jammer {
  id: string;
  position: GeoPoint;
  status: Status;
  jamMode: JamMode;
  supportedFrequencies: Frequency[];
  radius: number;
  directionDegrees?: number; // optional
}