export interface AllTypes {
    geoPoint:                        GeoPoint;
    messageWrapper:                  MessageWrapper;
    multiPlaneTrajectoryResult:      ScenarioPlanesSnapshot;
    planeCalculatedTrajectoryPoints: PlaneCalculatedTrajectoryPoints;
    planesTrajectoryPointsEvent:     Scenario;
    planeTrajectoryPoints:           PlaneTrajectoryPoints;
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
    /**
     * The inner object, to be deserialized according to the 'Type'. No schema enforced here.
     */
    data: { [key: string]: any };
    /**
     * The type of the inner message (used for dynamic deserialization)
     */
    type: string;
    //[property: string]: any;
}

export interface ScenarioPlanesSnapshot {
    scenarioId: string;
    planes: PlaneCalculatedTrajectoryPoints[];
    //[property: string]: any;
}

export interface PlaneCalculatedTrajectoryPoints {
    planeId:          string;
    planeName:        string;
    trajectoryPoints: TrajectoryPoint[]; // it's usually one point
    tailPoints: TrajectoryPoint[];
    isInDangerZone: boolean;
    dangerZonesIn: string[];
    //[property: string]: any;
}

export interface TrajectoryPoint {
    heading:  number;
    pitch:    number;
    position: GeoPoint;
    //[property: string]: any;
}

export interface PlaneTrajectoryPoints {
    planeId: string;
    geoPoints: GeoPoint[];
    planeName: string;
    velocity:  number;
    //[property: string]: any;
}

export interface Scenario {
    scenarioId: string;
    planes: PlaneTrajectoryPoints[];
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

export interface DangerZone {
  zoneId: string;
  zoneName: string;
  points: GeoPoint[];
  topHeight: number;
  bottomHeight: number; 
}

export interface DangerZoneError {
    errorMsg: string;
}

export interface InitData {
    scenarios: Scenario[];
    dangerZones: DangerZone[];
}

export interface ScenarioError {
    errorMsg: string;
}
