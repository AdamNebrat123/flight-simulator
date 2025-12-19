import React, { useState, useRef, useEffect } from "react";
import * as Cesium from "cesium";
import type { GeoPoint, Zone } from "../Messages/AllTypes";
import type { DangerZone } from "../Messages/AllTypes";
import "./CreateDangerZonePanel.css";
import { DangerZoneEntity } from "./DangerZoneEntity";
import { ZonePolyline } from "./ZonePolylineManager";
import { ZoneTypeEnum } from "../Messages/ZoneTypeEnum";

interface DangerZonePanelProps {
  viewerRef: React.MutableRefObject<Cesium.Viewer | null>;
  initialZone: Zone;
  onClose: () => void;
  onSave: (zone: DangerZone) => void;
}

export default function CreateDangerZonePanel({viewerRef,initialZone, onClose, onSave }: DangerZonePanelProps) {

  const initialDangerZone: DangerZone = {
  zoneType: ZoneTypeEnum.Danger, //  צריך להיות ראשון
  zoneId: initialZone.zoneId,
  zoneName: initialZone.zoneName,
  points: initialZone.points,
  topHeight: initialZone.topHeight,
  bottomHeight: initialZone.bottomHeight,
};
  
  const [dangerZone, setDangerZone] = useState<DangerZone>(JSON.parse(JSON.stringify(initialDangerZone)));

  const [isDrawing, setIsDrawing] = useState(false);
  const isDrawingRef = useRef(isDrawing);
  const handlerRef = useRef<Cesium.ScreenSpaceEventHandler | null>(null);
  const dangerZoneEntityRef = useRef<DangerZoneEntity | null>(null);
  const dangerZonePolylineRef = useRef<ZonePolyline | null>(null);
  const currentMousePositionRef = useRef<Cesium.Cartesian3 | null>(null);
  
  // Temporary polylines for the lines that follow the mouse
  const tempLineRef = useRef<Cesium.Entity | null>(null);
  const lastPointRef = useRef<Cesium.Cartesian3 | null>(null);
  const tempClosingLineRef = useRef<Cesium.Entity | null>(null);

  // REF that will always be synchronized with the state
  const dangerZoneRef = useRef<DangerZone>(dangerZone);
  useEffect(() => {
    dangerZoneRef.current = dangerZone;
  }, [dangerZone]);
  


const handleDangerZonePointChange = (
    pointIndex: number,
    field: keyof GeoPoint,
    value: number
  ) => {
    const updatedPoints = dangerZoneRef.current.points.map((p, idx) =>
      idx === pointIndex ? { ...p, [field]: value } : p
    );
    const newZone = { ...dangerZoneRef.current, points: updatedPoints };

    setDangerZone(newZone);
    dangerZoneRef.current = newZone; 

    dangerZonePolylineRef.current?.updatePoint(
      pointIndex,
      updatedPoints[pointIndex]
    );
  };

  useEffect(() => {
    if (viewerRef.current) {
      dangerZoneEntityRef.current = new DangerZoneEntity(
        viewerRef.current,
        dangerZone
      );
      dangerZonePolylineRef.current = new ZonePolyline(viewerRef.current);

      if(dangerZone.points && dangerZone.points.length > 0){
        // load existing polylines
        dangerZonePolylineRef.current.loadExistingPolylines(dangerZone)
      }

    }
    return () => {
      dangerZoneEntityRef.current?.SetEntityNull();
    };
  }, []);

  const stopAddingPoints = () => {
    if (!isDrawingRef.current) return;

    handlerRef.current?.destroy();
    handlerRef.current = null;
    setIsDrawing(false);
    isDrawingRef.current = false;

    if (tempLineRef.current) {
      viewerRef.current?.entities.remove(tempLineRef.current);
      tempLineRef.current = null;
    }
    if (tempClosingLineRef.current) {
        viewerRef.current?.entities.remove(tempClosingLineRef.current);
        tempClosingLineRef.current = null;
    }
    currentMousePositionRef.current = null;

    // Set the closing polyline to *constant* red
    dangerZonePolylineRef.current?.setColorConstantRed();
  
    //create the actual zone:
    dangerZoneEntityRef.current?.tryCreatePolygon();
    
    // if there is a visul polygon, we hide him (for comfort)
    dangerZoneEntityRef.current?.showEntity();

  };
  const toggleAddingPoints = () => {
    if (isDrawingRef.current) {
      stopAddingPoints();
      return;
    }
    if (!viewerRef.current) return;

    // if there is a visul polygon, we hide him (for comfort)
    dangerZoneEntityRef.current?.hideEntity();

    const viewer = viewerRef.current;
    setIsDrawing(true);
    isDrawingRef.current = true;

    dangerZonePolylineRef.current?.createPolyline();
    dangerZonePolylineRef.current?.createClosingPolyline();

    // Set the closing polyline to *transparent* red
    dangerZonePolylineRef.current?.setColorTransparentRed();
    if (dangerZoneRef.current.points.length > 0) {
      const lastPoint = dangerZoneRef.current.points[dangerZoneRef.current.points.length - 1];
        lastPointRef.current = Cesium.Cartesian3.fromDegrees(
          lastPoint.longitude,
          lastPoint.latitude,
          lastPoint.altitude
        );
      tryCreateTempLine(); // Try create the temp line (last point -> mouse) 
      tryCreateTempClosingLine(); // Try create the temp closing line (first point -> mouse)
    }

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    handler.setInputAction((click: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
      const earthPosition = viewer.scene.pickPosition(click.position);
      if (!Cesium.defined(earthPosition)) return;

      const carto = Cesium.Cartographic.fromCartesian(earthPosition);
      const newPoint: GeoPoint = {
        longitude: Cesium.Math.toDegrees(carto.longitude),
        latitude: Cesium.Math.toDegrees(carto.latitude),
        altitude: carto.height + 20,
      };

      

      const newZone = {
        ...dangerZoneRef.current,
        points: [...dangerZoneRef.current.points, newPoint],
      };
      setDangerZone(newZone);
      dangerZoneRef.current = newZone; 


      // update where needed
      dangerZonePolylineRef.current?.addPoint(newPoint);
      dangerZoneEntityRef.current?.UpdateZonePositions([...dangerZoneRef.current.points])

      if (tempLineRef.current) {
        viewer.entities.remove(tempLineRef.current);
        tempLineRef.current = null;
      }

      lastPointRef.current = Cesium.Cartesian3.fromDegrees(
        newPoint.longitude,
        newPoint.latitude,
        newPoint.altitude
      );
      currentMousePositionRef.current = null;

      // Set the closing polyline to *constant* red
      dangerZonePolylineRef.current?.setColorConstantRed();

    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    handler.setInputAction((movement: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
      if (!lastPointRef.current) return;

      const newPosition = viewer.scene.pickPosition(movement.endPosition);
      if (!Cesium.defined(newPosition)) return;

      // Set the closing polyline to *transparent* red
      dangerZonePolylineRef.current?.setColorTransparentRed();

      currentMousePositionRef.current = newPosition;

      // Try create the temp line (last point -> mouse) 
      tryCreateTempLine();

      // Try create the temp closing line (first point -> mouse)
      tryCreateTempClosingLine();


    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    handler.setInputAction(() => {
      stopAddingPoints();
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

    handlerRef.current = handler;
  };

  // clean on unmount
  useEffect(() => {
    return () => {
      if (handlerRef.current) {
        handlerRef.current.destroy();
        handlerRef.current = null;
        if (tempLineRef.current) viewerRef.current?.entities.remove(tempLineRef.current);
        if (tempClosingLineRef.current) viewerRef.current?.entities.remove(tempClosingLineRef.current);
      }
    };
  }, []);


  const tryCreateTempLine = () =>{
    // following line (last point -> mouse) 
    if (!tempLineRef.current) {
      tempLineRef.current = viewerRef.current!.entities.add({
        polyline: {
          positions: new Cesium.CallbackProperty(() => {
            if (!lastPointRef.current || !currentMousePositionRef.current) return undefined;
            return [lastPointRef.current, currentMousePositionRef.current];
          }, false),
          width: 3,
          material: Cesium.Color.RED,
        },
      });
    }
  }

  const tryCreateTempClosingLine = () =>{
    // closing line (first point -> mouse)
    if (dangerZoneRef.current.points.length > 0) {
      const firstPoint = dangerZoneRef.current.points[0];
      const firstCartesian = Cesium.Cartesian3.fromDegrees(
        firstPoint.longitude,
        firstPoint.latitude,
        firstPoint.altitude
      );

      if (!tempClosingLineRef.current) {
        tempClosingLineRef.current = viewerRef.current!.entities.add({
          polyline: {
            positions: new Cesium.CallbackProperty(() => {
              if (!currentMousePositionRef.current) return undefined;
              return [firstCartesian, currentMousePositionRef.current];
            }, false),
            width: 3,
            material: Cesium.Color.RED, 
          },
        });
      }
    }
  }

  const handleInputChange = (field: keyof DangerZone, value: any) => {
    const newZone = { ...dangerZone, [field]: value }
    setDangerZone(newZone);
    dangerZoneRef.current = newZone;
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
                {isDrawing ? "Stop adding points" : "Add points"}
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
                  <td>
                    <input
                      type="number"
                      value={p.longitude}
                      step="0.000001"
                      onChange={(e) =>
                        handleDangerZonePointChange(idx, "longitude", Number(e.target.value))
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={p.latitude}
                      step="0.000001"
                      onChange={(e) =>
                        handleDangerZonePointChange(idx, "latitude", Number(e.target.value))
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="dangerzone-actions">
          <button className="save-button" onClick={() => 
              {
                dangerZonePolylineRef.current?.remove()
                dangerZoneEntityRef.current?.RemoveEntity();
                dangerZoneEntityRef.current?.SetEntityNull();
                onSave(dangerZone)
                onClose()
              }
            }>
              Save
          </button>
          <button className="cancel-button" onClick={() =>
              {
                dangerZonePolylineRef.current?.remove()
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
