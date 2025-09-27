import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { useEffect, useRef } from "react"

type Props = {
  onViewerReady?: (viewer: Cesium.Viewer) => void;
};

export default function RealPlanesViewer({ onViewerReady }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let viewer: Cesium.Viewer;

    const init = async () => {
      const terrain = await Cesium.createWorldTerrainAsync();
      viewer = new Cesium.Viewer(containerRef.current!, {
        terrainProvider: terrain,
        scene3DOnly: true,
        animation: false,
        timeline: false,
      });

      viewer.scene.globe.depthTestAgainstTerrain = true;

      /*
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(34.77888, 32.02539, 250),
        orientation: {
          heading: Cesium.Math.toRadians(45.0),
          pitch: Cesium.Math.toRadians(-25.0),
        },
      });
      */

      viewerRef.current = viewer;
      onViewerReady?.(viewer); // Notify parent that viewer is ready
    };

    init();

    return () => {
      viewer?.destroy();
      viewerRef.current = null;
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '100vh' }} />;
}
