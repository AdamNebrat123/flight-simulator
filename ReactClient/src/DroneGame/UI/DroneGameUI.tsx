import KillIndicator from "./KillIndicator";
import KillFeed from "./KillFeed";
import { Crosshair } from "./Crosshair";
import type { Viewer } from "cesium";
import Minimap from "./Minimap";

interface DroneGameUIProps {
    viewer: Viewer | null;
    myDroneId?: string;
}

export default function DroneGameUI({ viewer, myDroneId }: DroneGameUIProps) {
    return (
        <>
            <Crosshair /> 
            <KillFeed />
            {myDroneId && <KillIndicator myDroneId={myDroneId} />}
            {viewer && myDroneId && <Minimap viewer={viewer} myDroneId={myDroneId} />}
        </>
    );
}