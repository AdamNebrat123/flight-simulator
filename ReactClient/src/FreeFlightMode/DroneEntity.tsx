import { useEffect } from "react";
import * as Cesium from "cesium";

type Props = {
  viewer: Cesium.Viewer;
  onReady?: (entity: Cesium.Entity) => void;
};

export default function DroneEntity({ viewer, onReady }: Props) {
  useEffect(() => {
    const drone = viewer.entities.add({
        id: "drone",
        name: "Drone",
        position: Cesium.Cartesian3.fromDegrees(34.78217676812864, 32.02684069644974, 158.7921526459921),
        model: {
            uri: "https://raw.githubusercontent.com/CesiumGS/cesium/master/Apps/SampleData/models/CesiumDrone/CesiumDrone.glb",
            minimumPixelSize: 64, // recommended size
            color: Cesium.Color.WHITE.withAlpha(0.9),
            silhouetteColor: Cesium.Color.YELLOW,
            silhouetteSize: 1.4,
        },
    });


    // Define drone heading in degrees (yaw)
    const droneYaw = 0; // degrees
    const dronePitch = 45;
    const droneRoll = 0;

    // Convert to Cesium HeadingPitchRoll
    const hpr = new Cesium.HeadingPitchRoll(
    Cesium.Math.toRadians(droneYaw),
    Cesium.Math.toRadians(dronePitch),
    Cesium.Math.toRadians(droneRoll)
    );

    // Create orientation as a Property
    const quaternion = Cesium.Transforms.headingPitchRollQuaternion(
    drone.position!.getValue(Cesium.JulianDate.now())!,
    hpr
    );

    drone.orientation = new Cesium.ConstantProperty(quaternion);

    // Camera offset to keep drone in third-person view
    const cameraDistance = 50; // meters behind
    const cameraHeight = 50;   // meters above
    const modelHeadingOffset = Cesium.Math.toRadians(-90); // fix model axis mismatch

    const dronePosition = drone.position!.getValue(Cesium.JulianDate.now());
    if (dronePosition) {
    // Compute third-person camera position relative to drone
    const heading = Cesium.Math.toRadians(droneYaw) + modelHeadingOffset;
    const pitch = Cesium.Math.toRadians(-35); // slightly downward

    // HeadingPitchRange: heading, pitch, range (distance from target)
    const range = Math.sqrt(cameraDistance * cameraDistance + cameraHeight * cameraHeight);

    viewer.camera.lookAt(
        dronePosition,
        new Cesium.HeadingPitchRange(
        heading,   // follow drone orientation
        pitch,     // look slightly downward
        range      // distance from the drone
        )
    );
    }

    // Return a reference to the Entity to the Parent
    onReady?.(drone);

    return () => {
      viewer.entities.remove(drone);
    };
  }, [viewer]);

  return null; // No UI
}
