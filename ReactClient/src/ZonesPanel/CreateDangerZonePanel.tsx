import React from "react";
import type { DangerZone, Zone } from "../Messages/AllTypes";

interface DangerPanelProps {
  zone: DangerZone;
  setZone: React.Dispatch<React.SetStateAction<Zone>>;
  viewerRef: React.MutableRefObject<any>;
}

export default function CreateDangerZonePanel({ zone, setZone }: DangerPanelProps) {
    console.log(zone);
  return (
    <div>
      {/* Here are only the fields special to DangerZone */}

    </div>
  );
}