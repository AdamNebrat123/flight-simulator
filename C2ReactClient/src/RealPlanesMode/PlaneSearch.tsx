import { useState } from "react";
import * as Cesium from "cesium";

type Props = {
  viewer: Cesium.Viewer | null;
  planesMap: Map<string, Cesium.Entity>; 
};

export default function PlaneSearch({ viewer, planesMap }: Props) {
  const [query, setQuery] = useState("");

  const handleFly = () => {
    if (!viewer || !query.trim()) return;

    const plane = planesMap.get(query.trim());
    if (plane) {
      const pos = (plane.position as Cesium.ConstantPositionProperty).getValue(Cesium.JulianDate.now());
      if (pos) {
        // convert Cartesian3 to Cartographic to get lat, lon, height
        const carto = Cesium.Cartographic.fromCartesian(pos);

        // add 5000 meters to height for better view
        const abovePos = Cesium.Cartesian3.fromRadians(
          carto.longitude,
          carto.latitude,
          carto.height + 5000
        );

        // fly to the position above the plane
        viewer.camera.flyTo({
          destination: abovePos,
          duration: 2.5,
          orientation: {
            heading: 0,
            pitch: -Math.PI / 2, // angle straight down to see the plane
            roll: 0
          }
        });
      }
    } else {
      alert("Could find this plane.");
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 20,
        left: 20,
        background: "rgba(0,0,0,0.6)",
        padding: "10px",
        borderRadius: "8px",
        color: "white",
        zIndex: 999,
      }}
    >
      <input
        type="text"
        placeholder="Enter plane id"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ padding: "4px 6px", marginRight: "6px" }}
      />
      <button onClick={handleFly} style={{ padding: "4px 8px" }}>
        Fly
      </button>
    </div>
  );
}
