import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlMWJkYzIwMS0wMGRlLTQ0ODEtOGV' +
  'hYS1jZjQ2OTdkMjM1MGMiLCJpZCI6MzIyMzA1LCJpYXQiOjE3NTI3Mzg2NzV9.nmq1IMbhgSV-XMzzVyiBLuKFrCtt52Av8q2KNkIIR3I';

type CesiumMapProps = {
  viewerRef: React.MutableRefObject<Cesium.Viewer | null>;
};

export default function CesiumMap({ viewerRef }: CesiumMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const viewer = new Cesium.Viewer(containerRef.current, {
      terrain: Cesium.Terrain.fromWorldTerrain(),
      scene3DOnly: true,
    });

    viewer.scene.globe.depthTestAgainstTerrain = true;

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(34.77888, 32.02539, 250),
      orientation: {
        heading: Cesium.Math.toRadians(45.0),
        pitch: Cesium.Math.toRadians(-25.0),
      },
    });

    Cesium.createOsmBuildingsAsync().then(buildingTileset => {
      viewer.scene.primitives.add(buildingTileset);
    });

    viewerRef.current = viewer;

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [viewerRef]);

  return <div ref={containerRef} style={{ width: '100%', height: '100vh' }} />;
}