import { useEffect, useRef } from "react";
import * as Cesium from "cesium";

type PlaneData = {
  id: string;
  callsign: string;
  lat: number;
  lon: number;
  alt: number;
};

type Props = {
  viewer: Cesium.Viewer | null;
};

export default function RealPlanesUpdater({ viewer }: Props) {
  const planesRef = useRef<Map<string, Cesium.Entity>>(new Map());

  useEffect(() => {
    if (!viewer) return;

    const fetchPlanes = async () => {
      try {
        const res = await fetch("https://opensky-network.org/api/states/all");
        const data = await res.json();

        const planes: PlaneData[] = data.states
          .map((p: any) => ({
            id: p[0],
            callsign: p[1]?.trim() || "N/A",
            lat: p[6],
            lon: p[5],
            alt: p[13],
          }))
          .filter(
            (p: PlaneData) => p.lat != null && p.lon != null && p.alt != null
          );

        if (planes.length === 0) return;

        planes.forEach((p) => {
          const cartesian = Cesium.Cartesian3.fromDegrees(p.lon, p.lat, p.alt);
          const cameraHeight = viewer.camera.positionCartographic.height;
          const scale = Math.max(0.8, Math.min(50, 1_000_000 / cameraHeight));
          const pixelSize = Math.max(12, Math.min(15, 1_500_000 / cameraHeight));

          let entity = planesRef.current.get(p.id);
          if (!entity) {
            entity = viewer.entities.add({
              id: p.id,
              position: cartesian,
              model: {
                uri: "https://raw.githubusercontent.com/CesiumGS/cesium/master/Apps/SampleData/models/CesiumAir/Cesium_Air.glb",
                scale,
                minimumPixelSize: 32,
                color: Cesium.Color.WHITE.withAlpha(0.9),
                silhouetteColor: Cesium.Color.YELLOW,
                silhouetteSize: 1.4,
                show: false, // update later based on camera 
              },
              point: {
                pixelSize: 8,
                color: Cesium.Color.RED,
                show: false,
              },
              label: {
                text: p.callsign,
                font: `${pixelSize}px sans-serif`,
                fillColor: Cesium.Color.WHITE,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 3,
                verticalOrigin: Cesium.VerticalOrigin.TOP,
                pixelOffset: new Cesium.Cartesian2(0, -30),
                show: false, // update later based on camera 
              },
            });
            planesRef.current.set(p.id, entity);
          } else {
            entity.position = new Cesium.ConstantPositionProperty(cartesian);
          }
        });
      } catch (err) {
        console.error("Error fetching planes:", err);
      }
    };

    fetchPlanes();
    const intervalId = window.setInterval(fetchPlanes, 60000);

    // Visibility update function based on field of view
    const updateVisibility = () => {
      if (!viewer) return;

      planesRef.current.forEach((entity) => {
        if (!entity.position) return;

        const pos = entity.position.getValue(Cesium.JulianDate.now());
        if (!pos) return;

        const windowCoord = Cesium.SceneTransforms.worldToWindowCoordinates(
          viewer.scene,
          pos
        );
        const inView =
          windowCoord &&
          windowCoord.x >= 0 &&
          windowCoord.x <= viewer.canvas.width &&
          windowCoord.y >= 0 &&
          windowCoord.y <= viewer.canvas.height;

        const cameraHeight = viewer.camera.positionCartographic.height;
        const useModel = cameraHeight < 450000;

        if (entity.model) entity.model.show = new Cesium.ConstantProperty(
          inView ? useModel : false
        );
        if (entity.point) entity.point.show = new Cesium.ConstantProperty(
          inView ? !useModel : false
        );
        if (entity.label) entity.label.show = new Cesium.ConstantProperty(
          inView ? true : false
        );
      });
    };

    viewer.scene.postRender.addEventListener(updateVisibility);

    return () => {
      window.clearInterval(intervalId);
      viewer.scene.postRender.removeEventListener(updateVisibility);
    };
  }, [viewer]);

  return null;
}
