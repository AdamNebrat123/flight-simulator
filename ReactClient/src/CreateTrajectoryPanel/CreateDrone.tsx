import { Frequency } from "../Sensors/Jammer/JammerRelatedEnums";
import type { AircraftTrajectory, DroneTrajectory, Scenario } from "../Messages/AllTypes";

interface DronelProps {
  aircrafts: AircraftTrajectory[]
  setAircrafts: React.Dispatch<React.SetStateAction<AircraftTrajectory[]>>;
  selectedAircraftIndex: number
  viewerRef: React.MutableRefObject<any>;
}

export default function CreateDrone({ aircrafts, setAircrafts,selectedAircraftIndex }: DronelProps) {

  const handleFrequencyChange = (value: Frequency) => {
        const updatedPlanes = [...aircrafts];
        const drone = updatedPlanes[selectedAircraftIndex] as DroneTrajectory;
        drone.frequency = value
        setAircrafts([...updatedPlanes]);
  };

  return (
    <>
    <div className="drone-fields">
      <label>
        Select Frequency:
        <select
          className="frequency-select"
          value={(aircrafts[selectedAircraftIndex] as DroneTrajectory).frequency ?? ""}
          onChange={(e) => handleFrequencyChange(e.target.value as Frequency)}
        >
          {Object.values(Frequency).map(freq => (
            <option key={freq} value={freq}>
              {freq}
            </option>
          ))}
        </select>
      </label>
    </div>
    <label></label>
    </>
  );
}
