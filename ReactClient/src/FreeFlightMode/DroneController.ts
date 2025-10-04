import * as Cesium from "cesium";
import { C2SMessageType } from "../Messages/C2SMessageType";
import type { Drone, GeoPoint, TrajectoryPoint } from "../Messages/AllTypes";

type DroneControllerProps = {
  viewer: Cesium.Viewer;
  send: (type: string, data: any) => void;
  drone: Cesium.Entity;
  maxSpeed?: number;       // מטר לשנייה
  acceleration?: number;   // מטר לשנייה^2
  damping?: number;        // ערך decay פר שנייה (0–1)
  intervalMs?: number;     // זמן קבוע בין physics updates
};

export function initDroneController({
  viewer,
  send,
  drone,
  maxSpeed = 50,
  acceleration = 20,
  damping = 0.097,
  intervalMs = 33, // ~30 updates/sec
}: DroneControllerProps) {
  const velocity = new Cesium.Cartesian3(0, 0, 0);

  let currentPos: Cesium.Cartesian3;
  if (!drone.position) {
    currentPos = new Cesium.Cartesian3(0, 0, 0);
  } else {
    currentPos = drone.position.getValue(viewer.clock.currentTime) as Cesium.Cartesian3;
  }

  const keys: Record<string, boolean> = {};
  let heading = 0;
  const arrowSensitivity = Cesium.Math.toRadians(4);
  const arrows: Record<string, boolean> = { ArrowLeft: false, ArrowRight: false };

  const keyDownHandler = (e: KeyboardEvent) => {
    keys[e.code] = true;
    if (arrows.hasOwnProperty(e.code)) arrows[e.code] = true;
  };
  const keyUpHandler = (e: KeyboardEvent) => {
    keys[e.code] = false;
    if (arrows.hasOwnProperty(e.code)) arrows[e.code] = false;
  };

  window.addEventListener("keydown", keyDownHandler);
  window.addEventListener("keyup", keyUpHandler);

  // ===== Physics update function =====
  const updateDronePhysics = (dt: number) => {
    // ===== Heading =====
    if (arrows["ArrowLeft"]) heading -= arrowSensitivity;
    if (arrows["ArrowRight"]) heading += arrowSensitivity;

    // ===== Local frame =====
    const enuMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(currentPos);
    const col = new Cesium.Cartesian4();
    Cesium.Matrix4.getColumn(enuMatrix, 0, col);
    const localEast = new Cesium.Cartesian3(col.x, col.y, col.z);
    Cesium.Matrix4.getColumn(enuMatrix, 1, col);
    const localNorth = new Cesium.Cartesian3(col.x, col.y, col.z);
    Cesium.Matrix4.getColumn(enuMatrix, 2, col);
    const localUp = new Cesium.Cartesian3(col.x, col.y, col.z);

    // ===== Horizontal acceleration =====
    const acc = new Cesium.Cartesian3(0, 0, 0);
    const forward = new Cesium.Cartesian3();
    const right = new Cesium.Cartesian3();
    Cesium.Cartesian3.multiplyByScalar(localNorth, Math.cos(heading), forward);
    Cesium.Cartesian3.add(
      forward,
      Cesium.Cartesian3.multiplyByScalar(localEast, Math.sin(heading), new Cesium.Cartesian3()),
      forward
    );
    Cesium.Cartesian3.multiplyByScalar(localNorth, -Math.sin(heading), right);
    Cesium.Cartesian3.add(
      right,
      Cesium.Cartesian3.multiplyByScalar(localEast, Math.cos(heading), new Cesium.Cartesian3()),
      right
    );

    if (keys["KeyW"]) Cesium.Cartesian3.add(acc, forward, acc);
    if (keys["KeyS"]) Cesium.Cartesian3.subtract(acc, forward, acc);
    if (keys["KeyD"]) Cesium.Cartesian3.add(acc, right, acc);
    if (keys["KeyA"]) Cesium.Cartesian3.subtract(acc, right, acc);

    if (!Cesium.Cartesian3.equals(acc, Cesium.Cartesian3.ZERO)) {
      Cesium.Cartesian3.normalize(acc, acc);
      Cesium.Cartesian3.multiplyByScalar(acc, acceleration * dt, acc);
      Cesium.Cartesian3.add(velocity, acc, velocity);
    }

    // ===== Vertical input =====
    let verticalDir = 0;
    if (keys["Space"]) verticalDir += 1;
    if (keys["ShiftLeft"] || keys["ShiftRight"]) verticalDir -= 1;

    if (verticalDir !== 0) {
      const verticalAcc = new Cesium.Cartesian3();
      Cesium.Cartesian3.multiplyByScalar(localUp, verticalDir * acceleration * dt, verticalAcc);
      Cesium.Cartesian3.add(velocity, verticalAcc, velocity);
    } else {
      const verticalVel = new Cesium.Cartesian3();
      Cesium.Cartesian3.multiplyByScalar(localUp, Cesium.Cartesian3.dot(velocity, localUp), verticalVel);
      const verticalDampingFactor = Math.pow(damping, dt);
      Cesium.Cartesian3.multiplyByScalar(verticalVel, 1 - verticalDampingFactor, verticalVel);
      Cesium.Cartesian3.subtract(velocity, verticalVel, velocity);
    }

    // ===== Horizontal damping =====
    if (!keys["KeyW"] && !keys["KeyS"] && !keys["KeyA"] && !keys["KeyD"] && verticalDir === 0) {
      const dampingFactor = Math.pow(damping, dt);
      Cesium.Cartesian3.multiplyByScalar(velocity, dampingFactor, velocity);
    }

    // ===== Clamp speed =====
    const speedMag = Cesium.Cartesian3.magnitude(velocity);
    if (speedMag > maxSpeed) {
      Cesium.Cartesian3.normalize(velocity, velocity);
      Cesium.Cartesian3.multiplyByScalar(velocity, maxSpeed, velocity);
    }

    // ===== Update position =====
    const displacement = new Cesium.Cartesian3();
    Cesium.Cartesian3.multiplyByScalar(velocity, dt, displacement);
    Cesium.Cartesian3.add(currentPos, displacement, currentPos);

    // ===== Send UpdateDrone =====
    const cartographic = Cesium.Cartographic.fromCartesian(currentPos);
    const updatedDrone: Drone = {
      id: drone.id as string,
      trajectoryPoint: {
        position: {
          longitude: Cesium.Math.toDegrees(cartographic.longitude),
          latitude: Cesium.Math.toDegrees(cartographic.latitude),
          altitude: cartographic.height
        } as GeoPoint,
        heading: Cesium.Math.toDegrees(heading),
        pitch: 0,
        roll: 0
      } as TrajectoryPoint
    };
    send(C2SMessageType.UpdateDrone, updatedDrone);
  };

  // ===== Start fixed interval =====
  const intervalId = setInterval(() => {
    updateDronePhysics(intervalMs / 1000); // convert ms to seconds
  }, intervalMs);

  return () => {
    clearInterval(intervalId);
    window.removeEventListener("keydown", keyDownHandler);
    window.removeEventListener("keyup", keyUpHandler);
  };
}
