import * as Cesium from "cesium";

// DroneController configuration interface
type DroneControllerProps = {
  viewer: Cesium.Viewer;
  drone: Cesium.Entity;
  speed?: number;        // max speed in meters per second
  acceleration?: number; // acceleration in meters per second^2
};

// Initialize the drone controller
export function initDroneController({
  viewer,
  drone,
  speed = 50,
  acceleration = 20,
}: DroneControllerProps) {
  // Current velocity vector in world coordinates
  const velocity = new Cesium.Cartesian3(0, 0, 0);

  // Input state
  const keys: Record<string, boolean> = {};

  // Listen for keyboard events
  const keyDownHandler = (e: KeyboardEvent) => (keys[e.code] = true);
  const keyUpHandler = (e: KeyboardEvent) => (keys[e.code] = false);
  window.addEventListener("keydown", keyDownHandler);
  window.addEventListener("keyup", keyUpHandler);

  // Tick handler: updates drone every frame
  const tickHandler = (_scene: Cesium.Scene, time: Cesium.JulianDate) => {
    if (!drone.position) return;

    const pos = drone.position.getValue(time) as Cesium.Cartesian3;
    if (!pos) return;

    // Compute acceleration vector based on input
    const acc = new Cesium.Cartesian3(0, 0, 0);
    if (keys["KeyW"]) acc.y += acceleration; // forward
    if (keys["KeyS"]) acc.y -= acceleration; // backward
    if (keys["KeyA"]) acc.x -= acceleration; // left
    if (keys["KeyD"]) acc.x += acceleration; // right
    if (keys["Space"]) acc.z += acceleration; // up
    if (keys["ShiftLeft"] || keys["ShiftRight"]) acc.z -= acceleration; // down

    // Approximate delta time (seconds)
    const dt = 0.016; // ~60fps

    // Update velocity: v = v + a * dt
    Cesium.Cartesian3.add(
      velocity,
      Cesium.Cartesian3.multiplyByScalar(acc, dt, new Cesium.Cartesian3()),
      velocity
    );

    // Clamp velocity magnitude to max speed
    const velMag = Cesium.Cartesian3.magnitude(velocity);
    if (velMag > speed) {
      Cesium.Cartesian3.multiplyByScalar(
        Cesium.Cartesian3.normalize(velocity, new Cesium.Cartesian3()),
        speed,
        velocity
      );
    }

    // Update position: p = p + v * dt
    const newPos = Cesium.Cartesian3.add(
      pos,
      Cesium.Cartesian3.multiplyByScalar(velocity, dt, new Cesium.Cartesian3()),
      new Cesium.Cartesian3()
    );

    drone.position = new Cesium.ConstantPositionProperty(newPos);

    // Optional: rotate drone to match velocity direction
    if (velMag > 0.1) {
      const heading = Math.atan2(velocity.x, velocity.y);
      const pitch = Math.atan2(-velocity.z, Math.sqrt(velocity.x ** 2 + velocity.y ** 2));
      const hpr = new Cesium.HeadingPitchRoll(heading, pitch, 0);
      const quat = Cesium.Transforms.headingPitchRollQuaternion(newPos, hpr);
      drone.orientation = new Cesium.ConstantProperty(quat);
    }
  };

  // Add the tick handler to the viewer clock
  viewer.clock.onTick.addEventListener(tickHandler);

  // Return cleanup function to remove listeners
  return () => {
    viewer.clock.onTick.removeEventListener(tickHandler);
    window.removeEventListener("keydown", keyDownHandler);
    window.removeEventListener("keyup", keyUpHandler);
  };
}
