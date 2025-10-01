import * as Cesium from "cesium";

type DroneControllerProps = {
  viewer: Cesium.Viewer;
  drone: Cesium.Entity;
  maxSpeed?: number;      // meters per second
  acceleration?: number;  // meters per second^2
  damping?: number;       // fraction of velocity reduced per second when no input
};

export function initDroneController({
  viewer,
  drone,
  maxSpeed = 50,
  acceleration = 20,
  damping = 0.9,
}: DroneControllerProps) {
  // Velocity in world coordinates
  const velocity = new Cesium.Cartesian3(0, 0, 0);

  // Keyboard state
  const keys: Record<string, boolean> = {};

  // Rotation state (controlled by arrows)
  let heading = 0;
  let pitch = 0;
  const arrowSensitivity = Cesium.Math.toRadians(2);

  // Key listeners
  const keyDownHandler = (e: KeyboardEvent) => { keys[e.code] = true; };
  const keyUpHandler = (e: KeyboardEvent) => { keys[e.code] = false; };

  window.addEventListener("keydown", keyDownHandler);
  window.addEventListener("keyup", keyUpHandler);

  let prevTime: Cesium.JulianDate | null = null;

  const tickHandler = (_scene: Cesium.Scene, time: Cesium.JulianDate) => {
    if (!drone.position) return;
    const pos = drone.position.getValue(time) as Cesium.Cartesian3;
    if (!pos) return;

    // Delta time
    let dt = 0.016;
    if (prevTime) dt = Cesium.JulianDate.secondsDifference(time, prevTime);
    prevTime = time;

    // Local ENU axes
    const enuMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(pos);
    const col = new Cesium.Cartesian4();
    Cesium.Matrix4.getColumn(enuMatrix, 0, col);
    const localEast = new Cesium.Cartesian3(col.x, col.y, col.z);
    Cesium.Matrix4.getColumn(enuMatrix, 1, col);
    const localNorth = new Cesium.Cartesian3(col.x, col.y, col.z);
    Cesium.Matrix4.getColumn(enuMatrix, 2, col);
    const localUp = new Cesium.Cartesian3(col.x, col.y, col.z);

    // --- Update heading & pitch from arrows ---
    if (keys["ArrowLeft"]) heading -= arrowSensitivity;
    if (keys["ArrowRight"]) heading += arrowSensitivity;
    if (keys["ArrowUp"]) pitch -= arrowSensitivity;
    if (keys["ArrowDown"]) pitch += arrowSensitivity;

    // --- Compute acceleration from WASD + SPACE/SHIFT ---
    const acc = new Cesium.Cartesian3(0, 0, 0);
    if (keys["KeyW"]) Cesium.Cartesian3.add(acc, localNorth, acc);
    if (keys["KeyS"]) Cesium.Cartesian3.subtract(acc, localNorth, acc);
    if (keys["KeyD"]) Cesium.Cartesian3.add(acc, localEast, acc);
    if (keys["KeyA"]) Cesium.Cartesian3.subtract(acc, localEast, acc);
    if (keys["Space"]) Cesium.Cartesian3.add(acc, localUp, acc);
    if (keys["ShiftLeft"] || keys["ShiftRight"]) Cesium.Cartesian3.subtract(acc, localUp, acc);

    Cesium.Cartesian3.multiplyByScalar(acc, acceleration, acc);

    // Apply acceleration to velocity
    Cesium.Cartesian3.multiplyByScalar(acc, dt, acc);
    Cesium.Cartesian3.add(velocity, acc, velocity);

    // Damping when no movement keys pressed
    const noInput = !keys["KeyW"] && !keys["KeyS"] && !keys["KeyA"] && !keys["KeyD"] &&
                    !keys["Space"] && !keys["ShiftLeft"] && !keys["ShiftRight"];
    if (noInput) {
      Cesium.Cartesian3.multiplyByScalar(velocity, Math.pow(damping, dt * 60), velocity);
    }

    // Clamp speed
    const speedMag = Cesium.Cartesian3.magnitude(velocity);
    if (speedMag > maxSpeed) {
      Cesium.Cartesian3.normalize(velocity, velocity);
      Cesium.Cartesian3.multiplyByScalar(velocity, maxSpeed, velocity);
    }

    // Update position
    const displacement = new Cesium.Cartesian3();
    Cesium.Cartesian3.multiplyByScalar(velocity, dt, displacement);
    const newPos = new Cesium.Cartesian3();
    Cesium.Cartesian3.add(pos, displacement, newPos);
    drone.position = new Cesium.ConstantPositionProperty(newPos);

    // Update orientation from heading & pitch (arrows only)
    const hpr = new Cesium.HeadingPitchRoll(heading, pitch, 0);
    const quat = Cesium.Transforms.headingPitchRollQuaternion(newPos, hpr);
    drone.orientation = new Cesium.ConstantProperty(quat);
  };

  viewer.clock.onTick.addEventListener(tickHandler);

  return () => {
    viewer.clock.onTick.removeEventListener(tickHandler);
    window.removeEventListener("keydown", keyDownHandler);
    window.removeEventListener("keyup", keyUpHandler);
  };
}
