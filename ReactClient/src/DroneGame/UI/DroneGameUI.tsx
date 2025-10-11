import KillIndicator from "./KillIndicator";
import KillFeed from "./KillFeed";
import { Crosshair } from "./Crosshair";

export default function DroneGameUI() {

  return (
    <>
        <Crosshair /> 
        <KillFeed />
        <KillIndicator />
    </>
  );
}