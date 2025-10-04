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

  // מיקום התחלה
  let currentPos: Cesium.Cartesian3;
  if (!drone.position) {
    currentPos = new Cesium.Cartesian3(0, 0, 0);
  } else {
    currentPos = drone.position.getValue(viewer.clock.currentTime) as Cesium.Cartesian3;
  }

  // מצב מקשים
  const keys: Record<string, boolean> = {};
  let heading = 0; // סיבוב סביב ציר Z
  let pitch = 0;   // סיבוב סביב ציר ימני (nose up/down)
  const arrowSensitivity = Cesium.Math.toRadians(4);
  const pitchSensitivity = Cesium.Math.toRadians(4);
  const arrows: Record<string, boolean> = { ArrowLeft: false, ArrowRight: false, ArrowUp: false, ArrowDown: false };

  // ===== Event listeners =====
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

  // ===== Physics update =====
  const updateDronePhysics = (dt: number) => {
    // ===== Update heading =====
    if (arrows["ArrowLeft"]) heading -= arrowSensitivity;
    if (arrows["ArrowRight"]) heading += arrowSensitivity;

    // ===== Update pitch =====
    if (arrows["ArrowUp"]) pitch += pitchSensitivity;
    if (arrows["ArrowDown"]) pitch -= pitchSensitivity;

    // >> ביטול ההגבלה: אין יותר clamp ל־±45°
    // pitch נשאר חופשי להסתובב 360 מעלות

    // ===== Local ENU frame =====
    const enuMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(currentPos);
    const col = new Cesium.Cartesian4();
    Cesium.Matrix4.getColumn(enuMatrix, 0, col);
    const localEast = new Cesium.Cartesian3(col.x, col.y, col.z);
    Cesium.Matrix4.getColumn(enuMatrix, 1, col);
    const localNorth = new Cesium.Cartesian3(col.x, col.y, col.z);
    Cesium.Matrix4.getColumn(enuMatrix, 2, col);
    const localUp = new Cesium.Cartesian3(col.x, col.y, col.z);

    // ===== Forward vector עם heading =====
    const forwardH = new Cesium.Cartesian3();
    Cesium.Cartesian3.multiplyByScalar(localNorth, Math.cos(heading), forwardH);
    Cesium.Cartesian3.add(
      forwardH,
      Cesium.Cartesian3.multiplyByScalar(localEast, Math.sin(heading), new Cesium.Cartesian3()),
      forwardH
    );
    Cesium.Cartesian3.normalize(forwardH, forwardH);

    // ===== Forward עם pitch (הפכתי את הסימן כדי שיתאים למודל שלך) =====
    const cosPitch = Math.cos(pitch);
    const sinPitch = Math.sin(pitch);
    const pitchedForward = new Cesium.Cartesian3(
      forwardH.x * cosPitch - localUp.x * sinPitch,
      forwardH.y * cosPitch - localUp.y * sinPitch,
      forwardH.z * cosPitch - localUp.z * sinPitch
    );
    Cesium.Cartesian3.normalize(pitchedForward, pitchedForward);

    // Right vector חדש בהתאם ל-pitched forward
    const right2 = new Cesium.Cartesian3();
    Cesium.Cartesian3.cross(pitchedForward, localUp, right2);
    Cesium.Cartesian3.normalize(right2, right2);

    // ===== Acceleration =====
    const acc = new Cesium.Cartesian3(0, 0, 0);
    if (keys["KeyW"]) Cesium.Cartesian3.add(acc, pitchedForward, acc);
    if (keys["KeyS"]) Cesium.Cartesian3.subtract(acc, pitchedForward, acc);
    if (keys["KeyD"]) Cesium.Cartesian3.add(acc, right2, acc);
    if (keys["KeyA"]) Cesium.Cartesian3.subtract(acc, right2, acc);

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

    // ===== Damping אופקי =====
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
        pitch: Cesium.Math.toDegrees(pitch),
        roll: 0
      } as TrajectoryPoint
    };
    send(C2SMessageType.UpdateDrone, updatedDrone);
  };

  // ===== Start fixed interval =====
  const intervalId = setInterval(() => {
    updateDronePhysics(intervalMs / 1000); // convert ms to seconds
  }, intervalMs);

  // ===== Cleanup =====
  return () => {
    clearInterval(intervalId);
    window.removeEventListener("keydown", keyDownHandler);
    window.removeEventListener("keyup", keyUpHandler);
  };
}
