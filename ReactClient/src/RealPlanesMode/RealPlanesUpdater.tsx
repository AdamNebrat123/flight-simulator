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
            lat: p[3],
            lon: p[4],
            alt: p[5] || 0,
          }))
          .filter((p: PlaneData) => p.lat && p.lon);

        if (planes.length === 0) return;

        // Prepare points for terrain mapping
        const terrainPositions = planes.map(p => Cesium.Cartographic.fromDegrees(p.lon, p.lat));

        // Get the actual height above ground for each plane
        const terrainHeights = await Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, terrainPositions);

        planes.forEach((p, idx) => {
          const terrainHeight = terrainHeights[idx].height || 0;
          const cartesian = Cesium.Cartesian3.fromDegrees(p.lon, p.lat, terrainHeight + p.alt); // Altitude above ground****
          console.log(terrainHeight + p.alt);

          let entity = planesRef.current.get(p.id);
          if (entity) {
            entity.position = new Cesium.ConstantPositionProperty(cartesian);
          } else {
            entity = viewer.entities.add({
              id: p.id,
              position: cartesian,
              point: { pixelSize: 8, color: Cesium.Color.RED },
              label: { text: p.callsign, font: "14pt sans-serif", style: Cesium.LabelStyle.FILL },
            });
            planesRef.current.set(p.id, entity);
          }
        });

      } catch (err) {
        console.error("Error fetching planes:", err);
      }
    };

    fetchPlanes();
    const intervalId = window.setInterval(fetchPlanes, 40000);

    return () => window.clearInterval(intervalId);
  }, [viewer, 40000]);

  return null;
}
