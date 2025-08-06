import { useState } from 'react';
import './CreateTrajectoryPanel.css';
import type { GeoPoint, PlaneTrajectoryPoints, PlanesTrajectoryPointsEvent } from '../Messages/AllTypes';

interface Props {
  onSave: (data: PlanesTrajectoryPointsEvent) => void;
  onCancel: (data: PlanesTrajectoryPointsEvent) => void;
}

let planeCounter = 1; // For default names

export default function CreateTrajectoryPanel({ onSave, onCancel }: Props) {
  const [eventData, setEventData] = useState<PlanesTrajectoryPointsEvent>({ planes: [] });

  const handleAddPlane = () => {
    const newPlane: PlaneTrajectoryPoints = {
      planeName: `Plane ${planeCounter++}`,
      velocity: 10,
      geoPoints: [],
    };
    setEventData(prev => ({
      ...prev,
      planes: [...prev.planes, newPlane],
    }));
  };

  const handlePlaneNameChange = (index: number, newName: string) => {
    const updatedPlanes = [...eventData.planes];
    updatedPlanes[index].planeName = newName;
    setEventData({ planes: updatedPlanes });
  };

  const handleVelocityChange = (index: number, newVelocity: number) => {
    const updatedPlanes = [...eventData.planes];
    updatedPlanes[index].velocity = newVelocity;
    setEventData({ planes: updatedPlanes });
  };

  const handleAddPoint = (index: number) => {
    const updatedPlanes = [...eventData.planes];
    updatedPlanes[index].geoPoints.push({
      latitude: 0,
      longitude: 0,
      altitude: 0,
    });
    setEventData({ planes: updatedPlanes });
  };

  const handleGeoPointChange = (
    planeIndex: number,
    pointIndex: number,
    field: keyof GeoPoint,
    value: number
  ) => {
    const updatedPlanes = [...eventData.planes];
    updatedPlanes[planeIndex].geoPoints[pointIndex][field] = value;
    setEventData({ planes: updatedPlanes });
  };

  return (
    <div className="trajectory-panel">
      <div className="trajectory-content">
        <button className="action-button" onClick={handleAddPlane}>Add plane</button>
        {eventData.planes.map((plane, planeIndex) => (
          <div key={planeIndex} className="plane-block">
            <details>
              <summary>
                <input
                  type="text"
                  value={plane.planeName}
                  onChange={(e) => handlePlaneNameChange(planeIndex, e.target.value)}
                  className="plane-name-input"
                />
              </summary>

              <div className="plane-fields">
                <label>
                  Velocity:
                  <input
                    type="number"
                    value={plane.velocity}
                    onChange={(e) => handleVelocityChange(planeIndex, +e.target.value)}
                  />
                </label>

                <div className="points-section">
                  <button className="action-button small" onClick={() => handleAddPoint(planeIndex)}>Add point</button>
                  <table>
                    <thead>
                      <tr>
                        <th>Latitude</th>
                        <th>Longitude</th>
                        <th>Altitude</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plane.geoPoints.map((point, pointIndex) => (
                        <tr key={pointIndex}>
                          <td>
                            <input
                              type="number"
                              value={point.latitude}
                              onChange={(e) =>
                                handleGeoPointChange(planeIndex, pointIndex, 'latitude', +e.target.value)
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={point.longitude}
                              onChange={(e) =>
                                handleGeoPointChange(planeIndex, pointIndex, 'longitude', +e.target.value)
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={point.altitude}
                              onChange={(e) =>
                                handleGeoPointChange(planeIndex, pointIndex, 'altitude', +e.target.value)
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </details>
          </div>
        ))}
      </div>

      <div className="trajectory-actions">
        <button className="action-button save-button" onClick={() => onSave(eventData)}>Save</button>
        <button className="action-button cancel-button" onClick={() => onCancel(eventData)}>Cancel</button>
      </div>
    </div>
  );
}