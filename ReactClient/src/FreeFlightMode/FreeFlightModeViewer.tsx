import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { useEffect, useRef } from "react"

type Props = {
  onViewerReady?: (viewer: Cesium.Viewer) => void;
};

export default function FreeFlightModeViewer({ onViewerReady }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    Cesium.Ion.defaultAccessToken = // accsess token for Cesium ion
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlMWJkYzIwMS0wMGRlLTQ0ODEtOGVhYS1jZjQ2OTdkMjM1MGMiLCJpZCI6MzIyMzA1LCJpYXQiOjE3NTI3Mzg2NzV9.nmq1IMbhgSV-XMzzVyiBLuKFrCtt52Av8q2KNkIIR3I';
    
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

      // add osm buildings to get all of the buildings (OSM = OpenStreetMap)
      const buildingTileset = await Cesium.createOsmBuildingsAsync();
      viewer.scene.primitives.add(buildingTileset);

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
