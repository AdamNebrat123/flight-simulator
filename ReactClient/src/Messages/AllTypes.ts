import type { Jammer } from "../Jamming/Jammer/Jammer";
import type { Frequency } from "../Jamming/Jammer/JammerRelatedEnums";
import type { ZoneTypeEnum } from "./ZoneTypeEnum";

export interface AllTypes {
    geoPoint:                        GeoPoint;
    messageWrapper:                  MessageWrapper;
    multiPlaneTrajectoryResult:      ScenarioAirCraftsSnapshot;
    planeCalculatedTrajectoryPoints: AircraftStatus;
    planesTrajectoryPointsEvent:     Scenario;
    planeTrajectoryPoints:           AircraftTrajectory;
    trajectoryPoint:                 TrajectoryPoint;
    //[property: string]: any;
}

export interface GeoPoint {
    altitude:  number;
    latitude:  number;
    longitude: number;
    //[property: string]: any;
}

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
  clientMode: string;
}

export interface ScenarioAirCraftsSnapshot {
    scenarioId: string;
    aircrafts: AircraftStatus[];
    //[property: string]: any;
}



export interface TrajectoryPoint {
    heading:  number;
    pitch:    number;
    roll:     number;
    position: GeoPoint;
    //[property: string]: any;
}



export interface Scenario {
    scenarioId: string;
    aircrafts: AircraftTrajectory[];
    scenarioName: string;
    //[property: string]: any;
}


export interface ScenariosReadyToPlay {
  scenariosIds: string[];
  //[property: string]: any;
}

export interface GetReadyScenariosRequestCmd {
  // no properties needed
}

export interface PlaySelectedScenario {
    scenarioId: string;
}

export interface PauseScenarioCmd {
  scenarioId: string;
}

export interface ResumeScenarioCmd {
  scenarioId: string;
}

export interface ChangeScenarioPlaySpeedCmd {
  scenarioId: string;
  playSpeed: number;
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

export interface ZoneError {
    errorMsg: string;
}


export interface InitData {
    scenarios: Scenario[];
    zones: DangerZone[];
    jammers: Jammer[];
}

export interface ScenarioError {
    errorMsg: string;
}

export interface Drone {
    id: string;
    trajectoryPoint: TrajectoryPoint;
}

export type DronesInitData = {
  yourDroneId: string;   // The UUID of the current user's drone
};

export interface CreateBullet {
  droneId: string;
  bulletId: string;
  startPosition: GeoPoint;
  endPosition: GeoPoint;
}

export interface BulletData {
  droneId: string;
  bulletId: string;
  position: GeoPoint;
  isLast: boolean;
}

export interface BulletsMsg {
    bullets: BulletData[];
}

export class DroneKilled {
  killerDroneId: string;
  killedDroneId: string;
  bulletId: string;

  constructor(killerDroneId: string, killedDroneId: string, bulletId: string) {
    this.killerDroneId = killerDroneId;
    this.killedDroneId = killedDroneId;
    this.bulletId = bulletId;
  }
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

export interface JammersUpdate {
  jammers: Jammer[];
}

export interface JammerError {
  errorMsg: string;
}