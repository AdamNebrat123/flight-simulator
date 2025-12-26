import { useState, useRef } from "react";
import RealPlanesViewer from "./RealPlanesViewer";
import RealPlanesUpdater from "./RealPlanesUpdater";
import * as Cesium from "cesium";
import PlaneSearch from "./PlaneSearch";

export default function RealPlanesMode() {
  const [viewer, setViewer] = useState<Cesium.Viewer | null>(null);

  const planesRef = useRef<Map<string, Cesium.Entity>>(new Map());

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <RealPlanesViewer onViewerReady={setViewer} />
      {viewer && <RealPlanesUpdater viewer={viewer} planesRef={planesRef}/>}
      <PlaneSearch viewer={viewer} planesMap={planesRef.current} />
    </div>
  );
}
