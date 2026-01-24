import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlMWJkYzIwMS0wMGRlLTQ0ODEtOGV' +
  'hYS1jZjQ2OTdkMjM1MGMiLCJpZCI6MzIyMzA1LCJpYXQiOjE3NTI3Mzg2NzV9.nmq1IMbhgSV-XMzzVyiBLuKFrCtt52Av8q2KNkIIR3I';

type CesiumMapProps = {
  viewerRef: React.MutableRefObject<Cesium.Viewer | null>;
  onViewerReady?: () => void;
};

export default function CesiumMap({ viewerRef, onViewerReady  }: CesiumMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const viewer = new Cesium.Viewer(containerRef.current, {
      terrain: Cesium.Terrain.fromWorldTerrain(),
      scene3DOnly: true,
    });


viewer.scene.postProcessStages.add(
  new Cesium.PostProcessStage({
    name: "blueTint",
    fragmentShader: `
      uniform sampler2D colorTexture;
      in vec2 v_textureCoordinates;
      out vec4 fragColor;

      void main() {
        vec4 color = texture(colorTexture, v_textureCoordinates);
        color.b = min(color.b + 0.18, 1.0); 
        fragColor = color;
      }
    `
  })
);
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
    // Notify parent that viewer is ready
    onViewerReady?.();

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [viewerRef]);

  return <div ref={containerRef} style={{ width: '100%', height: '100vh' }} />;
}