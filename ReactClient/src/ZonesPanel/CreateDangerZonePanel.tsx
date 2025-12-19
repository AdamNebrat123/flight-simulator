import React from "react";
import type { DangerZone } from "../Messages/AllTypes";

interface DangerPanelProps {
  initialZone: DangerZone;
  onSave: (zone: DangerZone) => void;
  onClose: () => void;
  viewerRef: React.MutableRefObject<any>;
}

export default function CreateDangerZonePanel({ initialZone }: DangerPanelProps) {
  return (
    <div>
      {/* Here are only the fields special to DangerZone */}

      <label>
        SHUMANNNNNNNNNNNNNNNNNNNNNNNNNNN
      </label>

    </div>
  );
}