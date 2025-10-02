import * as Cesium from "cesium";
import { DroneOrientationManager } from "./DroneOrientationManager";

type DroneControllerProps = {
  viewer: Cesium.Viewer;
  drone: Cesium.Entity;
  maxSpeed?: number;       // מטר לשנייה
  acceleration?: number;   // מטר לשנייה^2
  damping?: number;        // ערך decay פר שנייה (0–1)
};

export function initDroneController({
  viewer,
  drone,
  maxSpeed = 50,
  acceleration = 20,
  damping = 0.97,
}: DroneControllerProps) {
  const velocity = new Cesium.Cartesian3(0, 0, 0);
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

  let prevTime: Cesium.JulianDate | null = null;

  const headingOffset = Cesium.Math.toRadians(90);
  const orientationManager = new DroneOrientationManager(drone, headingOffset);

  const tickHandler = (_scene: Cesium.Scene, time: Cesium.JulianDate) => {
    if (!drone.position) return;
    const pos = drone.position.getValue(time) as Cesium.Cartesian3;
    if (!pos) return;

    // delta-time אמיתי
    let dt = 0;
    if (prevTime) dt = Cesium.JulianDate.secondsDifference(time, prevTime);
    prevTime = time;
    if (dt <= 0 || dt > 1) dt = 0.033; // ברירת מחדל ~30FPS

    // עדכון heading
    if (arrows["ArrowLeft"]) heading -= arrowSensitivity;
    if (arrows["ArrowRight"]) heading += arrowSensitivity;

    const enuMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(pos);
    const col = new Cesium.Cartesian4();
    Cesium.Matrix4.getColumn(enuMatrix, 0, col);
    const localEast = new Cesium.Cartesian3(col.x, col.y, col.z);
    Cesium.Matrix4.getColumn(enuMatrix, 1, col);
    const localNorth = new Cesium.Cartesian3(col.x, col.y, col.z);
    Cesium.Matrix4.getColumn(enuMatrix, 2, col);
    const localUp = new Cesium.Cartesian3(col.x, col.y, col.z);

    const acc = new Cesium.Cartesian3(0, 0, 0);

    // כיוונים לפי heading
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

    // קלט אופקי
    if (keys["KeyW"]) Cesium.Cartesian3.add(acc, forward, acc);
    if (keys["KeyS"]) Cesium.Cartesian3.subtract(acc, forward, acc);
    if (keys["KeyD"]) Cesium.Cartesian3.add(acc, right, acc);
    if (keys["KeyA"]) Cesium.Cartesian3.subtract(acc, right, acc);

    // קלט אנכי – SPACE/SHIFT
    let verticalDir = 0;
    if (keys["Space"]) verticalDir += 1;
    if (keys["ShiftLeft"] || keys["ShiftRight"]) verticalDir -= 1;

    if (verticalDir !== 0) {
      // לחיצה – תאוצה רגילה
      const verticalAcc = new Cesium.Cartesian3();
      Cesium.Cartesian3.multiplyByScalar(localUp, verticalDir * acceleration * dt, verticalAcc);
      Cesium.Cartesian3.add(velocity, verticalAcc, velocity);
    } else {
      // לא לוחץ – דאמפינג חזק במיוחד למרכיב האנכי
      const verticalVel = new Cesium.Cartesian3();
      Cesium.Cartesian3.multiplyByScalar(localUp, Cesium.Cartesian3.dot(velocity, localUp), verticalVel);
      const verticalDampingFactor = Math.pow(damping, dt * 120); // יותר חזק מהדאמפינג האופקי
      Cesium.Cartesian3.multiplyByScalar(verticalVel, 1 - verticalDampingFactor, verticalVel);
      Cesium.Cartesian3.subtract(velocity, verticalVel, velocity);
    }

    // תאוצה אופקית
    if (!Cesium.Cartesian3.equals(acc, Cesium.Cartesian3.ZERO)) {
      Cesium.Cartesian3.normalize(acc, acc);
      Cesium.Cartesian3.multiplyByScalar(acc, acceleration * dt, acc);
      Cesium.Cartesian3.add(velocity, acc, velocity);
    }

    // דאמפינג מותאם ל-30FPS (אופקי)
    const noInput =
      !keys["KeyW"] && !keys["KeyS"] && !keys["KeyA"] && !keys["KeyD"] &&
      verticalDir === 0;

    if (noInput) {
      const dampingFactor = Math.pow(damping, dt * 30);
      Cesium.Cartesian3.multiplyByScalar(velocity, dampingFactor, velocity);
    }

    // הגבלת מהירות
    const speedMag = Cesium.Cartesian3.magnitude(velocity);
    if (speedMag > maxSpeed) {
      Cesium.Cartesian3.normalize(velocity, velocity);
      Cesium.Cartesian3.multiplyByScalar(velocity, maxSpeed, velocity);
    }

    // עדכון מיקום
    const displacement = new Cesium.Cartesian3();
    Cesium.Cartesian3.multiplyByScalar(velocity, dt, displacement);
    const newPos = new Cesium.Cartesian3();
    Cesium.Cartesian3.add(pos, displacement, newPos);
    drone.position = new Cesium.ConstantPositionProperty(newPos);

    // עדכון orientation
    orientationManager.setOrientationFromHeading(heading, newPos);
  };

  viewer.clock.onTick.addEventListener(tickHandler);

  return () => {
    viewer.clock.onTick.removeEventListener(tickHandler);
    window.removeEventListener("keydown", keyDownHandler);
    window.removeEventListener("keyup", keyUpHandler);
  };
}
