import { useRef } from 'react';
import * as Cesium from 'cesium';
import CesiumMap from './CesiumMap';

export default function App() {
  const viewerRef = useRef<Cesium.Viewer | null>(null);

  return (
    <>
      <CesiumMap viewerRef={viewerRef} />
    </>
  );
}