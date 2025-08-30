import React, { useState, useRef, useEffect } from "react";
import * as Cesium from "cesium";
import type { GeoPoint, PlaneTrajectoryPoints, Scenario } from "../Messages/AllTypes";
import "./CreateTrajectoryPanel.css";
import { toast } from "react-toastify";
import { PlanePolylineManager } from "./PlanePolylineManager";
import { PlanePolylineInteraction } from "./PlanePolylineInteraction";
import AerialUnitSelection from "./AerialUnitSelection";


interface Props {
  viewerRef: React.MutableRefObject<Cesium.Viewer | null>;
  initialScenario: Scenario;
  onSave: (data: Scenario) => void;
  onCancel: (data: Scenario) => void;
}

export default function CreateTrajectoryPanel({ viewerRef, initialScenario, onSave, onCancel }: Props) {
    const [scenario, setScenario] = useState<Scenario>(
        JSON.parse(JSON.stringify(initialScenario)) // deep copy to avoid mutating the prop
    );
    const [isDrawing, setIsDrawing] = useState(false);
    const isDrawingRef = useRef(isDrawing);

    useEffect(() => {
    isDrawingRef.current = isDrawing;
    }, [isDrawing]);
    
    const [selectedPlaneIndex, setSelectedPlaneIndex] = useState<number | null>(null);
    const handlerRef = useRef<Cesium.ScreenSpaceEventHandler | null>(null);
    const polylineManagerRef = useRef<PlanePolylineManager | null>(null);
    const polylineInteractionRef = useRef<PlanePolylineInteraction | null>(null);
    const currentMousePositionRef = useRef<Cesium.Cartesian3 | null>(null);
    
    // Temporary polyline for the line that follows the mouse
    const tempLineRef = useRef<Cesium.Entity | null>(null);
    const lastPointRef = useRef<Cesium.Cartesian3 | null>(null);

    useEffect(() => {
    if (viewerRef.current) {
        polylineManagerRef.current = new PlanePolylineManager(viewerRef.current);
        polylineInteractionRef.current = new PlanePolylineInteraction(viewerRef.current,polylineManagerRef.current)
    }
    if(scenario.planes && scenario.planes.length > 0){
        // load existing polylines
        polylineManagerRef.current?.loadExistingPolylines(scenario);
        setSelectedPlaneIndex(0);
    }

    return () => {
        polylineManagerRef.current?.clearAll();
        polylineInteractionRef.current?.destroy();
    };
    }, []);

    const cleanTemporaryPolyline = () => {
        if(tempLineRef.current)
            viewerRef.current?.entities.remove(tempLineRef.current);
        tempLineRef.current = null;
        lastPointRef.current = null;
        currentMousePositionRef.current = null;
    }

    // Handler for scenario name change
    const handleScenarioNameChange = (newName: string) => {
    setScenario((prev) => ({
        ...prev,
        scenarioName: newName,
    }));
    };

    // Adds a new plane with a default name
    const handleAddPlane = () => {
        const newPlane: PlaneTrajectoryPoints = {
        planeName: `Plane ${scenario.planes.length + 1}`,
        velocity: 50,
        geoPoints: [],
        planeId: ""
        };
        setScenario(prev => ({
        ...prev,
        planes: [...prev.planes, newPlane],
        }));
        setSelectedPlaneIndex(scenario.planes.length); // length BEFORE adding is the new index
    };

    
    const handlePlaneNameChange = (index: number, newName: string) => {
        const updatedPlanes = [...scenario.planes];
        updatedPlanes[index].planeName = newName;
        setScenario({ planes: updatedPlanes, scenarioName: scenario.scenarioName, scenarioId: scenario.scenarioId });
    };

    const handleVelocityChange = (index: number, newVelocity: number) => {
        const updatedPlanes = [...scenario.planes];
        updatedPlanes[index].velocity = newVelocity;
        setScenario({ planes: updatedPlanes, scenarioName: scenario.scenarioName, scenarioId: scenario.scenarioId });
    };

    const handleGeoPointChange = (
        planeIndex: number,
        pointIndex: number,
        field: keyof GeoPoint,
        value: number
    ) => {
        const updatedPlanes = [...scenario.planes];
        updatedPlanes[planeIndex].geoPoints[pointIndex][field] = value;
        const updatedPoint = updatedPlanes[planeIndex].geoPoints[pointIndex];
        setScenario({ planes: updatedPlanes, scenarioName: scenario.scenarioName, scenarioId: scenario.scenarioId });
        const planeName = updatedPlanes[planeIndex].planeName;
        polylineManagerRef.current?.updatePoint(planeName, pointIndex, updatedPoint)
    };

    const stopAddingPoints = () => {
        if (!isDrawingRef.current) return; // use ref instead of state

        handlerRef.current?.destroy();
        handlerRef.current = null;
        setIsDrawing(false);
        isDrawingRef.current = false; // sync immediately

        // Removing the temporary line
        if (tempLineRef.current) {
            viewerRef.current?.entities.remove(tempLineRef.current);
            tempLineRef.current = null;
        }
        lastPointRef.current = null;
        currentMousePositionRef.current = null;

        // make the trajectory cyan
        const planeName = scenario.planes[selectedPlaneIndex!].planeName;
        polylineManagerRef.current?.setPlanePolylineColorCyan(planeName);
    };



    const toggleAddingPoints = () => {
        if (isDrawingRef.current) {
            stopAddingPoints();
            return;
        }

        if (selectedPlaneIndex === null) {
            toast.error("Please select a plane first!");
            return;
        }
        if (!viewerRef.current) return;

        const viewer = viewerRef.current;
        setIsDrawing(true);
        isDrawingRef.current = true;

        const plane = scenario.planes[selectedPlaneIndex];
        const planeName = plane.planeName;
        polylineManagerRef.current?.createPolyline(planeName);
        polylineManagerRef.current?.setPlanePolylineColorYellow(planeName);

        const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

        // If plane already has points, use last one as start for temp line
        if (plane.geoPoints.length > 0) {
            const lastGeo = plane.geoPoints[plane.geoPoints.length - 1];
            lastPointRef.current = Cesium.Cartesian3.fromDegrees(
                lastGeo.longitude,
                lastGeo.latitude,
                lastGeo.altitude
            );

            // Create temp line immediately
            tempLineRef.current = viewer.entities.add({
                polyline: {
                    positions: new Cesium.CallbackProperty(() => {
                        if (!lastPointRef.current || !currentMousePositionRef.current) return undefined;
                        return [lastPointRef.current, currentMousePositionRef.current];
                    }, false),
                    width: 3,
                    material: Cesium.Color.YELLOW,
                },
            });
        }

        // LEFT_CLICK adds point
        handler.setInputAction((click: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
            const earthPosition = viewer.scene.pickPosition(click.position);
            if (!Cesium.defined(earthPosition)) return;

            const carto = Cesium.Cartographic.fromCartesian(earthPosition);
            const newPoint: GeoPoint = {
                longitude: Cesium.Math.toDegrees(carto.longitude),
                latitude: Cesium.Math.toDegrees(carto.latitude),
                altitude: carto.height + 5,
            };

            polylineManagerRef.current?.addPoint(planeName, newPoint);

            setScenario((prev) => {
                const newPlanes = [...prev.planes];
                newPlanes[selectedPlaneIndex].geoPoints = [
                    ...newPlanes[selectedPlaneIndex].geoPoints,
                    newPoint,
                ];
                return { ...prev, planes: newPlanes };
            });

            lastPointRef.current = Cesium.Cartesian3.fromDegrees(
                newPoint.longitude,
                newPoint.latitude,
                newPoint.altitude
            );
            currentMousePositionRef.current = null;
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        // MOUSE_MOVE updates temp line
        handler.setInputAction((movement: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
            if (!lastPointRef.current) return;

            const newPosition = viewer.scene.pickPosition(movement.endPosition);
            if (!Cesium.defined(newPosition)) return;

            currentMousePositionRef.current = newPosition;
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        handlerRef.current = handler;

        // RIGHT_CLICK stops drawing 
        handler.setInputAction(() => {
             stopAddingPoints(); 
            }, Cesium.ScreenSpaceEventType.RIGHT_CLICK); handlerRef.current = handler;
    };
    // Cleans up listener when component is disassembled or state changes
    useEffect(() => {
        return () => {
        if (handlerRef.current) {
            handlerRef.current.destroy();
            handlerRef.current = null;
            cleanTemporaryPolyline();
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
        value={scenario.scenarioName}
        onChange={(e) => handleScenarioNameChange(e.target.value)}
        />
        <AerialUnitSelection></AerialUnitSelection> {/* this is the component the lets you selecet AerialUnit by image */}

        <button className="addPlane-button" onClick={handleAddPlane} disabled={isDrawing}>
            Add Plane
        </button>
        {scenario.planes.length > 0 && (
            <>
            <div style={{ marginTop: 8 }}>
                <label htmlFor="plane-select">Select plane to add points:</label>
                <select
                id="plane-select"
                value={selectedPlaneIndex !== null ? selectedPlaneIndex : ""}
                onChange={(e) => setSelectedPlaneIndex(e.target.value === "" ? null : Number(e.target.value))}
                disabled={isDrawing}
                style={{ marginLeft: 8 }}
                >
                <option value="" disabled>
                    -- Select a plane --
                </option>
                {scenario.planes.map((plane, index) => (
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
                {isDrawing ? "Stop adding points" : "Add points"}
            </button>
            <label style={{ fontFamily: 'Serif', fontSize: 20, fontWeight: 500, color: '#ffffff', lineHeight: 1.4 }}>
                Planes
                </label>
            </>
        )}

        <div>
        {selectedPlaneIndex !== null && scenario.planes[selectedPlaneIndex] && (
            <div className="plane-block">
            <details open>
                <summary>
                <input
                    type="text"
                    value={scenario.planes[selectedPlaneIndex].planeName}
                    onChange={(e) => handlePlaneNameChange(selectedPlaneIndex, e.target.value)}
                    className="plane-name-input"
                />
                </summary>

                <div className="plane-fields" style={{ marginTop: 8 }}>
                <label>
                    Velocity:
                    <input
                    type="number"
                    value={scenario.planes[selectedPlaneIndex].velocity}
                    onChange={(e) => handleVelocityChange(selectedPlaneIndex, Number(e.target.value))}
                    style={{ marginLeft: 8, width: 60 }}
                    />
                </label>

                {scenario.planes[selectedPlaneIndex].geoPoints.length > 0 && (
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
                        {scenario.planes[selectedPlaneIndex].geoPoints.map((point, pIndex) => (
                            <tr key={pIndex}>
                            <td>
                                <input
                                type="number"
                                value={point.longitude}
                                step="0.000001"
                                onChange={(e) =>
                                    handleGeoPointChange(selectedPlaneIndex, pIndex, "longitude", Number(e.target.value))
                                }
                                />
                            </td>
                            <td>
                                <input
                                type="number"
                                value={point.latitude}
                                step="0.000001"
                                onChange={(e) =>
                                    handleGeoPointChange(selectedPlaneIndex, pIndex, "latitude", Number(e.target.value))
                                }
                                />
                            </td>
                            <td>
                                <input
                                type="number"
                                value={point.altitude}
                                step="0.01"
                                onChange={(e) =>
                                    handleGeoPointChange(selectedPlaneIndex, pIndex, "altitude", Number(e.target.value))
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
        )}
        </div>
        </div>

        <div className="trajectory-actions" style={{ marginTop: 12 }}>
        <button className="action-button save-button" onClick={
            () => {
            cleanTemporaryPolyline();
            onSave(scenario);
            }}>
                Save
        </button>
        <button className="action-button cancel-button" onClick={() => {
            cleanTemporaryPolyline();
            onCancel(scenario);
            }}>
                Cancel
        </button>
        </div>
    </div>
    );
}
