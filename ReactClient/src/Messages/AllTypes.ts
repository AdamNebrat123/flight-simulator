export interface AllTypes {
    geoPoint:                        GeoPoint;
    messageWrapper:                  MessageWrapper;
    multiPlaneTrajectoryResult:      MultiPlaneTrajectoryResult;
    planeCalculatedTrajectoryPoints: PlaneCalculatedTrajectoryPoints;
    planesTrajectoryPointsEvent:     PlanesTrajectoryPointsScenario;
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

export interface MultiPlaneTrajectoryResult {
    planes: PlaneCalculatedTrajectoryPoints[];
    //[property: string]: any;
}

export interface PlaneCalculatedTrajectoryPoints {
    planeName:        string;
    trajectoryPoints: TrajectoryPoint[];
    //[property: string]: any;
}

export interface TrajectoryPoint {
    heading:  number;
    pitch:    number;
    position: GeoPoint;
    //[property: string]: any;
}

export interface PlaneTrajectoryPoints {
    geoPoints: GeoPoint[];
    planeName: string;
    velocity:  number;
    //[property: string]: any;
}

export interface PlanesTrajectoryPointsScenario {
    planes: PlaneTrajectoryPoints[];
    scenarioName: string;
    //[property: string]: any;
}