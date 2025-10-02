import * as Cesium from "cesium";
import { DroneOrientationManager } from "./DroneOrientationManager";

type DroneControllerProps = {
  viewer: Cesium.Viewer;
  drone: Cesium.Entity;
  maxSpeed?: number;
  acceleration?: number;
  damping?: number;
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
  let heading = 0; // internal heading
  const arrowSensitivity = Cesium.Math.toRadians(2);
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

  // ===========================
  const tickHandler = (_scene: Cesium.Scene, time: Cesium.JulianDate) => {
    if (!drone.position) return;
    const pos = drone.position.getValue(time) as Cesium.Cartesian3;
    if (!pos) return;
    let dt = 0.016;
    if (prevTime) dt = Cesium.JulianDate.secondsDifference(time, prevTime);
    prevTime = time;

    // עדכון heading מהחצים
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

    // כיוונים יחסיים ל-heading
    const forward = new Cesium.Cartesian3();
    const right = new Cesium.Cartesian3();
    Cesium.Cartesian3.multiplyByScalar(localNorth, Math.cos(heading), forward);
    Cesium.Cartesian3.add(forward, Cesium.Cartesian3.multiplyByScalar(localEast, Math.sin(heading), new Cesium.Cartesian3()), forward);

    Cesium.Cartesian3.multiplyByScalar(localNorth, -Math.sin(heading), right);
    Cesium.Cartesian3.add(right, Cesium.Cartesian3.multiplyByScalar(localEast, Math.cos(heading), new Cesium.Cartesian3()), right);

    if (keys["KeyW"]) Cesium.Cartesian3.add(acc, forward, acc);
    if (keys["KeyS"]) Cesium.Cartesian3.subtract(acc, forward, acc);
    if (keys["KeyD"]) Cesium.Cartesian3.add(acc, right, acc);
    if (keys["KeyA"]) Cesium.Cartesian3.subtract(acc, right, acc);
    if (keys["Space"]) Cesium.Cartesian3.add(acc, localUp, acc);
    if (keys["ShiftLeft"] || keys["ShiftRight"]) Cesium.Cartesian3.subtract(acc, localUp, acc);

    Cesium.Cartesian3.multiplyByScalar(acc, acceleration, acc);
    Cesium.Cartesian3.multiplyByScalar(acc, dt, acc);
    Cesium.Cartesian3.add(velocity, acc, velocity);

    const noInput = !keys["KeyW"] && !keys["KeyS"] && !keys["KeyA"] && !keys["KeyD"] &&
                    !keys["Space"] && !keys["ShiftLeft"] && !keys["ShiftRight"];
    if (noInput) {
      Cesium.Cartesian3.multiplyByScalar(velocity, Math.pow(damping, dt * 60), velocity);
    }

    const speedMag = Cesium.Cartesian3.magnitude(velocity);
    if (speedMag > maxSpeed) {
      Cesium.Cartesian3.normalize(velocity, velocity);
      Cesium.Cartesian3.multiplyByScalar(velocity, maxSpeed, velocity);
    }

    const displacement = new Cesium.Cartesian3();
    Cesium.Cartesian3.multiplyByScalar(velocity, dt, displacement);
    const newPos = new Cesium.Cartesian3();
    Cesium.Cartesian3.add(pos, displacement, newPos);
    drone.position = new Cesium.ConstantPositionProperty(newPos);

    // ===========================
    orientationManager.setOrientationFromHeading(heading, newPos);

  };

  viewer.clock.onTick.addEventListener(tickHandler);

  return () => {
    viewer.clock.onTick.removeEventListener(tickHandler);
    window.removeEventListener("keydown", keyDownHandler);
    window.removeEventListener("keyup", keyUpHandler);
  };
}
