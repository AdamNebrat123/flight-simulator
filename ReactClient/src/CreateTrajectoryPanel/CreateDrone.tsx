import { Frequency } from "../Sensors/Jammer/JammerRelatedEnums";
import type { AircraftTrajectory, DroneTrajectory, Scenario } from "../Messages/AllTypes";

interface DronelProps {
  scenario: Scenario;
  selectedAircraftIndex: number
  setScenario: React.Dispatch<React.SetStateAction<Scenario>>;
  viewerRef: React.MutableRefObject<any>;
}

export default function CreateDrone({ scenario, setScenario,selectedAircraftIndex }: DronelProps) {

  const handleFrequencyChange = (value: Frequency) => {
        const updatedPlanes = [...scenario.aircrafts];
        const drone = updatedPlanes[selectedAircraftIndex] as DroneTrajectory;
        drone.frequency = value
        setScenario({ aircrafts: updatedPlanes, scenarioName: scenario.scenarioName, scenarioId: scenario.scenarioId });
  };

  return (
    <>
    <div className="drone-fields">
      <label>
        Select Frequency:
        <select
          className="frequency-select"
          value={(scenario.aircrafts[selectedAircraftIndex] as DroneTrajectory).frequency ?? ""}
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
