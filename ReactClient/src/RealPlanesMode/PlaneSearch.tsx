import { useState } from "react";
import * as Cesium from "cesium";

type Props = {
  viewer: Cesium.Viewer | null;
  planesMap: Map<string, Cesium.Entity>; // נקבל את המפה של המטוסים מהקומפוננטה הראשית
};

export default function PlaneSearch({ viewer, planesMap }: Props) {
  const [query, setQuery] = useState("");

  const handleFly = () => {
    if (!viewer || !query.trim()) return;

    const plane = planesMap.get(query.trim());
    if (plane) {
      viewer.flyTo(plane, {
        duration: 2.5,
        offset: new Cesium.HeadingPitchRange(
          0,
          Cesium.Math.toRadians(-45), // מבט מלמעלה בזווית 45°
          5000                         // מרחק מצלמה (מטרים)
        )
      });
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
