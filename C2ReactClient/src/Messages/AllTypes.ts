import type { Jammer } from "../Jamming/Jammer/Jammer";
import type { Frequency } from "../Jamming/Jammer/JammerRelatedEnums";
import type { ZoneTypeEnum } from "./ZoneTypeEnum";

/**
 * Intermediate wrapper containing a type string and raw data to be deserialized based on
 * the type
 */
export interface MessageWrapper {
   //The inner object, to be deserialized according to the 'Type'. No schema enforced here.
  data: { [key: string]: any };
   //The type of the inner message (used for dynamic deserialization)
  type: string;
   //The mode of the message (used for routing)
}

export interface GeoPoint {
    altitude:  number;
    latitude:  number;
    longitude: number;
    //[property: string]: any;
}

export interface TrajectoryPoint {
    heading:  number;
    pitch:    number;
    roll:     number;
    position: GeoPoint;
    //[property: string]: any;
}

export interface ScenarioAirCraftsSnapshot {
    scenarioId: string;
    aircrafts: AircraftStatus[];
    //[property: string]: any;
}

export interface Zone {
  zoneType: string;
  zoneId: string;
  zoneName: string;
  points: GeoPoint[];
  topHeight: number;
  bottomHeight: number;
}

export interface DangerZone extends Zone {
  zoneType: ZoneTypeEnum.Danger;
}

export interface JamZone extends Zone {
  jammersIds: string[];
  zoneType: ZoneTypeEnum.Jam;
}

export interface JammersUpdate {
  jammers: Jammer[];
}

// Base trajectory
export interface AircraftTrajectory {
    aircraftType: string;
    aircraftId: string;
    geoPoints: GeoPoint[];
    aircraftName: string;
    velocity:  number;
    //[property: string]: any;
}

export interface DroneTrajectory extends AircraftTrajectory {
  frequency: Frequency;
}

export interface PlaneTrajectory extends AircraftTrajectory {
  // Plane-specific properties (none for now)
}

export interface BalloonTrajectory extends AircraftTrajectory {
  // Balloon-specific properties (none for now)
}

export interface B2spiritTrajectory extends AircraftTrajectory {
  // B2 Spirit-specific properties (none for now)
}

export interface F16Trajectory extends AircraftTrajectory {
  // F-16-specific properties (none for now)
}

export interface F34Trajectory extends AircraftTrajectory {
  // F-34-specific properties (none for now)
}

export interface IaiKfirTrajectory extends AircraftTrajectory {
  // IAI Kfir-specific properties (none for now)
}

export interface UavTrajectory extends AircraftTrajectory {
  // UAV-specific properties (none for now)
}

// Base status
export interface AircraftStatus {
    aircraftType: string;
    aircraftId:          string;
    aircraftName:        string;
    trajectoryPoints: TrajectoryPoint[]; // actually one point, but kept as array for server consistency
    tailPoints: TrajectoryPoint[];
    isInDangerZone: boolean;
    dangerZonesIn: string[];
    //[property: string]: any;
}

export interface DroneStatus extends AircraftStatus {
  frequency: Frequency;
}

export interface PlaneStatus extends AircraftStatus {
  // Plane-specific properties (none for now)
}

export interface BalloonStatus extends AircraftStatus {
  // Balloon-specific properties (none for now)
}

export interface B2spiritStatus extends AircraftStatus {
  // B2 Spirit-specific properties (none for now)
}

export interface F16Status extends AircraftStatus {
  // F-16-specific properties (none for now)
}

export interface F34Status extends AircraftStatus {
  // F-34-specific properties (none for now)
}

export interface IaiKfirStatus extends AircraftStatus {
  // IAI Kfir-specific properties (none for now)
}

export interface UavStatus extends AircraftStatus {
  // UAV-specific properties (none for now)
}




