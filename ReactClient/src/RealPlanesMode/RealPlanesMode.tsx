import { useState } from "react";
import RealPlanesViewer from "./RealPlanesViewer";
import RealPlanesUpdater from "./RealPlanesUpdater";
import * as Cesium from "cesium";

export default function RealPlanesMode() {
  const [viewer, setViewer] = useState<Cesium.Viewer | null>(null);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <RealPlanesViewer onViewerReady={setViewer} />
      {viewer && <RealPlanesUpdater viewer={viewer} />}
    </div>
  );
}
