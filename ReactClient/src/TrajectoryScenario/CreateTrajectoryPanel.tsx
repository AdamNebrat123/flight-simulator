import React, { useState, useRef, useEffect } from "react";
import * as Cesium from "cesium";
import type { GeoPoint, PlaneTrajectoryPoints, PlanesTrajectoryPointsScenario } from "../Messages/AllTypes";
import "./CreateTrajectoryPanel.css";
import { PointEntityManager } from "./PointEntityManager";
import { toast } from "react-toastify";

interface Props {
  viewerRef: React.MutableRefObject<Cesium.Viewer | null>;
  onSave: (data: PlanesTrajectoryPointsScenario) => void;
  onCancel: (data: PlanesTrajectoryPointsScenario) => void;
}

export default function CreateTrajectoryPanel({ viewerRef, onSave, onCancel }: Props) {
    const [eventData, setEventData] = useState<PlanesTrajectoryPointsScenario>({ planes: [],scenarioName: "ScenarioName"});
    const [isAddingPoints, setIsAddingPoints] = useState(false);
    const [selectedPlaneIndex, setSelectedPlaneIndex] = useState<number | null>(null);
    const handlerRef = useRef<Cesium.ScreenSpaceEventHandler | null>(null);
    const entityManagerRef = useRef<PointEntityManager | null>(null);

    useEffect(() => {
    if (viewerRef.current) {
        entityManagerRef.current = new PointEntityManager(viewerRef.current);
    }
    return () => {
        entityManagerRef.current?.removeAllEntities();
    };
    }, []);

    // Handler for scenario name change
    const handleScenarioNameChange = (newName: string) => {
    setEventData((prev) => ({
        ...prev,
        scenarioName: newName,
    }));
    };

    // Adds a new plane with a default name
    const handleAddPlane = () => {
        const newPlane: PlaneTrajectoryPoints = {
        planeName: `Plane ${eventData.planes.length + 1}`,
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
        setEventData({ planes: updatedPlanes, scenarioName: eventData.scenarioName});
    };

    const handleVelocityChange = (index: number, newVelocity: number) => {
        const updatedPlanes = [...eventData.planes];
        updatedPlanes[index].velocity = newVelocity;
        setEventData({ planes: updatedPlanes, scenarioName: eventData.scenarioName });
    };

    const handleGeoPointChange = (
        planeIndex: number,
        pointIndex: number,
        field: keyof GeoPoint,
        value: number
    ) => {
        const updatedPlanes = [...eventData.planes];
        updatedPlanes[planeIndex].geoPoints[pointIndex][field] = value;
        const updatedPoint = updatedPlanes[planeIndex].geoPoints[pointIndex];
        setEventData({ planes: updatedPlanes, scenarioName: eventData.scenarioName });
        entityManagerRef.current?.updateEntityPosition(updatedPoint);
    };


    // Starts or stops adding points mode
    const toggleAddingPoints = (): void => {
        if (isAddingPoints) {
        // If we are already in point adding mode — stop and clean up listener
        if (handlerRef.current) {
            handlerRef.current.destroy();
            handlerRef.current = null;
        }
        setIsAddingPoints(false);
        setSelectedPlaneIndex(null);
        } else {
        // If you want to start adding points
        if (selectedPlaneIndex === null) {
            toast.error("Please select a plane first!"); // Non blocking alert! (it important cuase its not blocking!!!!!)
            return;
        }
        if (!viewerRef.current) return;

        setIsAddingPoints(true);

        const viewer = viewerRef.current;

        // Create a new listener for map clicks
        const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        handler.setInputAction((click: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
            const earthPosition = viewer.scene.pickPosition(click.position);
            if (Cesium.defined(earthPosition)) {
            const cartographic = Cesium.Cartographic.fromCartesian(earthPosition);
            const longitude = Cesium.Math.toDegrees(cartographic.longitude);
            const latitude = Cesium.Math.toDegrees(cartographic.latitude);
            const altitude = cartographic.height;
            const newPoint: GeoPoint = { longitude, latitude, altitude };
            // Update state with a new point in the selected plane
            setEventData(prev => {
            const newPlanes = [...prev.planes];
            const currentPoints = newPlanes[selectedPlaneIndex].geoPoints;

            // Check if the point already exists by reference
            if (!currentPoints.includes(newPoint)) {
                newPlanes[selectedPlaneIndex].geoPoints = [...currentPoints, newPoint];
                // Add entity
                entityManagerRef.current?.addEntityForPoint(newPoint);
            } else {
                console.log("Point already exists, not adding");
            }
            return { ...prev, planes: newPlanes };
            });
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        handlerRef.current = handler;
        }
    };
    
    // Cleans up listener when component is disassembled or state changes
    useEffect(() => {
        return () => {
        if (handlerRef.current) {
            handlerRef.current.destroy();
            handlerRef.current = null;
        }
        };
    }, []);

    return (
    <div className="trajectory-panel">
        <div className="trajectory-content">
        <input
        id="scenario-name"
        type="text"
        className="scenarioName"
        value={eventData.scenarioName}
        onChange={(e) => handleScenarioNameChange(e.target.value)}
        />
        <button className="addPlane-button" onClick={handleAddPlane}>
            Add Plane
        </button>
        {eventData.planes.length > 0 && (
            <>
            <div style={{ marginTop: 8 }}>
                <label htmlFor="plane-select">Select plane to add points:</label>
                <select
                id="plane-select"
                value={selectedPlaneIndex !== null ? selectedPlaneIndex : ""}
                onChange={(e) => setSelectedPlaneIndex(e.target.value === "" ? null : Number(e.target.value))}
                disabled={isAddingPoints}
                style={{ marginLeft: 8 }}
                >
                <option value="" disabled>
                    -- Select a plane --
                </option>
                {eventData.planes.map((plane, index) => (
                    <option key={index} value={index}>
                    {plane.planeName}
                    </option>
                ))}
                </select>
            </div>

            <button
                className="addPoints-button"
                onClick={toggleAddingPoints}
            >
                {isAddingPoints ? "Stop adding points" : "Add points"}
            </button>
            <label style={{ fontFamily: 'Serif', fontSize: 20, fontWeight: 500, color: '#ffffff', lineHeight: 1.4 }}>
                Planes
                </label>
            </>
        )}

        <div>
            {eventData.planes.map((plane, index) => (
            <div key={index} className="plane-block">
                <details open>
                <summary>
                    <input
                    type="text"
                    value={plane.planeName}
                    onChange={(e) => handlePlaneNameChange(index, e.target.value)}
                    className="plane-name-input"
                    />
                </summary>

                <div className="plane-fields" style={{ marginTop: 8 }}>
                    <label>
                    Velocity:
                    <input
                        type="number"
                        value={plane.velocity}
                        onChange={(e) => handleVelocityChange(index, Number(e.target.value))}
                        style={{ marginLeft: 8, width: 60 }}
                    />
                    </label>

                    {plane.geoPoints.length > 0 && (
                    <div className="points-section">
                        <table>
                        <thead>
                            <tr>
                            <th>Longitude</th>
                            <th>Latitude</th>
                            <th>Altitude</th>
                            </tr>
                        </thead>
                        <tbody>
                            {plane.geoPoints.map((point, pIndex) => (
                            <tr key={pIndex}>
                                <td>
                                <input
                                    type="number"
                                    value={point.longitude}
                                    step="0.000001"
                                    onChange={(e) =>
                                    handleGeoPointChange(index, pIndex, "longitude", Number(e.target.value))
                                    }
                                />
                                </td>
                                <td>
                                <input
                                    type="number"
                                    value={point.latitude}
                                    step="0.000001"
                                    onChange={(e) =>
                                    handleGeoPointChange(index, pIndex, "latitude", Number(e.target.value))
                                    }
                                />
                                </td>
                                <td>
                                <input
                                    type="number"
                                    value={point.altitude}
                                    step="0.01"
                                    onChange={(e) =>
                                    handleGeoPointChange(index, pIndex, "altitude", Number(e.target.value))
                                    }
                                />
                                </td>
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                    )}
                </div>
                </details>
            </div>
            ))}
        </div>
        </div>

        <div className="trajectory-actions" style={{ marginTop: 12 }}>
        <button className="action-button save-button" onClick={
            () => {
            entityManagerRef.current?.removeAllEntities();
            onSave(eventData);
            }}>
                Save
        </button>
        <button className="action-button cancel-button" onClick={() => {
            entityManagerRef.current?.removeAllEntities();
            onCancel(eventData);
            }}>
                Cancel
        </button>
        </div>
    </div>
    );
}
