import React from "react";
import type { JamZone, Zone } from "../Messages/AllTypes";

interface JamPanelProps {
  viewerRef: React.MutableRefObject<any>;
  zone: JamZone;
  setZone: React.Dispatch<React.SetStateAction<Zone>>;
}

export default function CreateJamZonePanel({ zone, setZone }: JamPanelProps) {
    console.log(zone);
  return (
    <div>
      {/* Here are only the fields specific to JamZone */}

    </div>
  );
}
