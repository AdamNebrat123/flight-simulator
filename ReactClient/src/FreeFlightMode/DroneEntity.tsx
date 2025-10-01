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


    const cameraDistance = 100; // meters behind the drone
    const cameraHeight = 0;   // meters above the drone

    const dronePosition = drone.position!.getValue(Cesium.JulianDate.now());

    if (dronePosition) {
    // add height to the drone's position
    const cameraTarget = new Cesium.Cartesian3(
        dronePosition.x,
        dronePosition.y,
        dronePosition.z + cameraHeight
    );

    viewer.camera.lookAt(
        cameraTarget,
        new Cesium.HeadingPitchRange(
        -45.55,                          // heading: backward
        Cesium.Math.toRadians(-40), // pitch: slightly downward
        cameraDistance               // distance from the drone
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
