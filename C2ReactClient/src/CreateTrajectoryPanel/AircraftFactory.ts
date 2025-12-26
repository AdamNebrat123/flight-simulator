import { AircraftTypeEnum } from "../Messages/AircraftTypeEnum";
import type { AircraftTrajectory, B2spiritTrajectory, BalloonTrajectory, DroneTrajectory, F16Trajectory, F34Trajectory, IaiKfirTrajectory, PlaneTrajectory, UavTrajectory } from "../Messages/AllTypes";




export function createAircraftByType(
  type: AircraftTypeEnum | string,
  existing?: Partial<AircraftTrajectory>
): AircraftTrajectory {
  const factoryMap: Record<string, () => AircraftTrajectory> = {
    [AircraftTypeEnum.Drone]: createDrone,
    [AircraftTypeEnum.Plane]: createPlane,
    [AircraftTypeEnum.Balloon]: createBalloon,
    [AircraftTypeEnum.B2spirit]: createB2spirit,
    [AircraftTypeEnum.F16]: createF16,
    [AircraftTypeEnum.F35]: createF34,
    [AircraftTypeEnum.IaiKfir]: createIaiKfir,
    [AircraftTypeEnum.Uav]: createUav,
  };

  const createFn = factoryMap[type];
  if (!createFn) {
    console.error(`No factory function found for aircraft type: ${type}`);
  }

  const newAircraft = createFn();

  if (existing) {
    if (existing.geoPoints) newAircraft.geoPoints = existing.geoPoints;
    if (existing.velocity !== undefined) newAircraft.velocity = existing.velocity;
  }

  return newAircraft;
}






export function createDrone(): DroneTrajectory {
  const drone = {
    aircraftType: AircraftTypeEnum.Drone,
    aircraftId: "",
    aircraftName: "Drone",
    geoPoints: [],
    velocity: 50
  };
  console.log("Created Drone:", drone);
  return drone;
}

export function createPlane(): PlaneTrajectory {
  const plane = {
    aircraftType: AircraftTypeEnum.Plane,
    aircraftId: "",
    aircraftName: "Plane",
    geoPoints: [],
    velocity: 50
  };
  console.log("Created Plane:", plane);
  return plane;
}

export function createBalloon(): BalloonTrajectory {
  const balloon = {
    aircraftType: AircraftTypeEnum.Balloon,
    aircraftId: "",
    aircraftName: "Balloon",
    geoPoints: [],
    velocity: 50
  };
  console.log("Created Balloon:", balloon);
  return balloon;
}

export function createB2spirit(): B2spiritTrajectory {
  const b2 = {
    aircraftType: AircraftTypeEnum.B2spirit,
    aircraftId: "",
    aircraftName: "B2spirit",
    geoPoints: [],
    velocity: 50
  };
  console.log("Created B2spirit:", b2);
  return b2;
}

export function createF16(): F16Trajectory {
  const f16 = {
    aircraftType: AircraftTypeEnum.F16,
    aircraftId: "",
    aircraftName: "F16",
    geoPoints: [],
    velocity: 50
  };
  console.log("Created F16:", f16);
  return f16;
}

export function createF34(): F34Trajectory {
  const f34 = {
    aircraftType: AircraftTypeEnum.F35,
    aircraftId: "",
    aircraftName: "F34",
    geoPoints: [],
    velocity: 50
  };
  console.log("Created F34:", f34);
  return f34;
}

export function createIaiKfir(): IaiKfirTrajectory {
  const kfir = {
    aircraftType: AircraftTypeEnum.IaiKfir,
    aircraftId: "",
    aircraftName: "IaiKfir",
    geoPoints: [],
    velocity: 50
  };
  console.log("Created IAI Kfir:", kfir);
  return kfir;
}

export function createUav(): UavTrajectory {
  const uav = {
    aircraftType: AircraftTypeEnum.Uav,
    aircraftId: "",
    aircraftName: "UAV",
    geoPoints: [],
    velocity: 50
  };
  console.log("Created UAV:", uav);
  return uav;
}
