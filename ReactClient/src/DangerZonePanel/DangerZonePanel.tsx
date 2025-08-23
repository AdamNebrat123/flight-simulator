import React, { useState, useRef, useEffect } from "react";
import * as Cesium from "cesium";
import type { GeoPoint } from "../Messages/AllTypes";
import type { DangerZone } from "../Messages/AllTypes";
import "./DangerZonePanel.css";
import { DangerZoneEntity } from "./DangerZoneEntity";
import type { DangerZoneEntityManager } from "./DangerZoneEntityManager";

interface DangerZonePanelProps {
  viewerRef: React.MutableRefObject<Cesium.Viewer | null>;
  dangerZoneEntityManagerRef: React.MutableRefObject<DangerZoneEntityManager | null>;
  onClose: () => void;
  onSave: (zone: DangerZone) => void;
}

export default function DangerZonePanel({viewerRef, dangerZoneEntityManagerRef: dangerZoneEntityManagerRef, onClose, onSave }: DangerZonePanelProps) {
  const [dangerZone, setDangerZone] = useState<DangerZone>({
    zoneName: "ZoneName",
    points: [],
    topHeight: 100,
    bottomHeight: 0,
  });
  const [isAddingPoints, setIsAddingPoints] = useState(false);
  const handlerRef = useRef<Cesium.ScreenSpaceEventHandler | null>(null);
  const dangerZoneEntityRef = useRef<DangerZoneEntity | null>(null);
  
  useEffect(() => {
    if (viewerRef.current) {
      dangerZoneEntityRef.current = new DangerZoneEntity(
        viewerRef.current,
        dangerZone.points,
        dangerZone.bottomHeight,
        dangerZone.topHeight,
        dangerZone.zoneName
      );
    }
    return () => {
        dangerZoneEntityRef.current?.SetEntityNull();
    };
  }, []);


  const toggleAddingPoints = (): void => {
  if (isAddingPoints) {
    // If we are already in point adding mode — stop and clean up listener
    if (handlerRef.current) {
      handlerRef.current.destroy();
      handlerRef.current = null;
    }
    setIsAddingPoints(false);
    return; // stop here
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

      // Update the current DangerZone's points
      setDangerZone(prev => {
        if (!prev) return prev;

        // Avoid duplicate points
        const exists = prev.points.some(
          p => p.longitude === newPoint.longitude && p.latitude === newPoint.latitude && p.altitude === newPoint.altitude
        );
        if (exists) return prev;

        const updatedPoints = [...prev.points, newPoint];

        dangerZoneEntityRef.current?.UpdateZonePositions(updatedPoints); // update the 3D polygon positions
        return { ...prev, points: updatedPoints };
      });
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  handlerRef.current = handler;
};

// Clean up listener when component unmounts or toggles
useEffect(() => {
  return () => {
    if (handlerRef.current) {
      handlerRef.current.destroy();
      handlerRef.current = null;
    }
  };
}, []);



  const handleInputChange = (field: keyof DangerZone, value: any) => {
    setDangerZone(prev => ({ ...prev, [field]: value }));
      switch (field) {
        case "bottomHeight":
          dangerZoneEntityRef.current?.UpdateZoneBottomHeight(value); // update the 3D polygon bottomHeight
          break;
        case "topHeight":
          dangerZoneEntityRef.current?.UpdateZoneTopHeight(value); // update the 3D polygon topHeight
          break;
        case "zoneName":
          dangerZoneEntityRef.current?.UpdateZoneName(value); // update the 3D polygon name
          break;
      }
  };

  return (
    <div className="dangerzone-panel">
      <div className="dangerzone-content">
        <input
          type="text"
          placeholder="Zone Name"
          className="dangerzone-name-input"
          value={dangerZone.zoneName}
          onChange={(e) => handleInputChange("zoneName", e.target.value)}
        />

        <div className="dangerzone-fields">
          <label>
            Bottom Height (m):
            <input
              type="number"
              value={dangerZone.bottomHeight}
              onChange={(e) => handleInputChange("bottomHeight", Number(e.target.value))}
            />
          </label>
          <label>
            Top Height (m):
            <input
              type="number"
              value={dangerZone.topHeight}
              onChange={(e) => handleInputChange("topHeight", Number(e.target.value))}
            />
          </label>
        </div>

        <button
            className="startAddingPoints-button"
            onClick={toggleAddingPoints}
            >
                {isAddingPoints ? "Stop adding points" : "Add points"}
        </button>
        
        <div className="points-section">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Longitude</th>
                <th>Latitude</th>
              </tr>
            </thead>
            <tbody>
              {dangerZone.points.map((p, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{p.longitude.toFixed(6)}</td>
                  <td>{p.latitude.toFixed(6)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="dangerzone-actions">
          <button className="save-button" onClick={() => 
          {
            const entity = dangerZoneEntityRef.current?.GetEntity()
            if(entity)
              dangerZoneEntityManagerRef.current?.tryAddDangerZone(dangerZone.zoneName, entity)
            console.log(entity)
            dangerZoneEntityRef.current?.SetEntityNull();
            onSave(dangerZone)
          }
        }>
          Save
          </button>
          <button className="cancel-button" onClick={() =>
              {
                dangerZoneEntityRef.current?.RemoveEntity();
                dangerZoneEntityRef.current?.SetEntityNull();
                onClose()
              }
              }>
                Cancel
                </button>
        </div>
      </div>
    </div>
  );
}
