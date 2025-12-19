import React from "react";
import type { JamZone } from "../Messages/AllTypes";

interface JamPanelProps {
  initialZone: JamZone;
  onSave: (zone: JamZone) => void;
  onClose: () => void;
  viewerRef: React.MutableRefObject<any>;
}

export default function CreateJamZonePanel({ initialZone }: JamPanelProps) {
    const zone = initialZone as JamZone;
  return (
    <div>
      {/* Here are only the fields specific to JamZone */}
      <label>
        Jam SHMIN FLITZZZZZZZZZZZZZZZZZZZZZZ
      </label>
    </div>
  );
}
