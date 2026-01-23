import React, { useState, useRef, useEffect } from "react";
import * as Cesium from "cesium";
import type { GeoPoint, Zone } from "../Messages/AllTypes";
import type { DangerZone, JamZone } from "../Messages/AllTypes";
import { ZoneTypeEnum } from "../Messages/ZoneTypeEnum";
import { ZoneEntity } from "../Zones/ZoneEntity";
import { ZonePolyline } from "../Zones/ZonePolylineManager";
import "./CreateZonePanel.css";
import CreateDangerZonePanel from "./CreateDangerZonePanel";
import CreateJamZonePanel from "./CreateJamZonePanel";
import { ZoneOptionsManager } from "../Zones/ZoneOptions";

interface ZonePanelProps {
  viewerRef: React.MutableRefObject<Cesium.Viewer | null>;
  initialZone: Zone;
  onClose: () => void;
  onSave: (zone: Zone) => void;
}



export default function CreateZonePanel({viewerRef,initialZone, onClose, onSave }: ZonePanelProps) {

      const [zone, setZone] = useState<Zone>({...initialZone});
      const [zoneType, setZoneType] = useState<string>("");

      const [isDrawing, setIsDrawing] = useState(false);
      const isDrawingRef = useRef(isDrawing);
      const handlerRef = useRef<Cesium.ScreenSpaceEventHandler | null>(null);
      const zoneEntityRef = useRef<ZoneEntity | null>(null);
      const zonePolylineRef = useRef<ZonePolyline | null>(null);
      const currentMousePositionRef = useRef<Cesium.Cartesian3 | null>(null);
      
      // Temporary polylines for the lines that follow the mouse
      const tempLineRef = useRef<Cesium.Entity | null>(null);
      const lastPointRef = useRef<Cesium.Cartesian3 | null>(null);
      const tempClosingLineRef = useRef<Cesium.Entity | null>(null);
    
      // REF that will always be synchronized with the state
      const zoneRef = useRef<Zone>(zone);
      useEffect(() => {
        zoneRef.current = zone;
      }, [zone]);
      
    
    const handleZoneTypeChange = (type: string) => {
        const newZone = {
        ...zone,
        zoneType: type,
        };
        setZoneType(type);

        setZone(newZone);

        UpdateZoneEntityAndPolyline(newZone);

    };

    const handleZonePointChange = (
        pointIndex: number,
        field: keyof GeoPoint,
        value: number
      ) => {
        const updatedPoints = zoneRef.current.points.map((p, idx) =>
          idx === pointIndex ? { ...p, [field]: value } : p
        );
        const newZone = { ...zoneRef.current, points: updatedPoints };
    
        setZone(newZone);
        zoneRef.current = newZone; 
    
        zonePolylineRef.current?.updatePoint(
          pointIndex,
          updatedPoints[pointIndex]
        );
      };

      const UpdateZoneEntityAndPolyline = (zone: Zone)=>{
        if (viewerRef.current) {
          if(zoneEntityRef.current){
            zoneEntityRef.current?.RemoveEntity();
            zoneEntityRef.current?.SetEntityNull();
            zoneEntityRef.current?.setZone(zone);
            zoneEntityRef.current?.tryCreatePolygon();
          }
          if(zonePolylineRef.current){
            zonePolylineRef.current?.setZone(zone);

            if(zone.points && zone.points.length > 0){
              // load existing polylines
              zonePolylineRef.current.loadExistingPolylines(zone)
            }
        }
    
        }
      }
    
      useEffect(() => {
        if (viewerRef.current) {
          if(zoneEntityRef.current){
            zoneEntityRef.current?.SetEntityNull();
          }
          if(zonePolylineRef.current){
            zonePolylineRef.current?.remove();
          }
          zoneEntityRef.current = new ZoneEntity(
            viewerRef.current,
            zone
          );
          zonePolylineRef.current = new ZonePolyline(viewerRef.current, zone);
    
          if(zone.points && zone.points.length > 0){
            // load existing polylines
            zonePolylineRef.current.loadExistingPolylines(zone)
          }
    
        }
        return () => {
          zoneEntityRef.current?.SetEntityNull();
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
        zonePolylineRef.current?.setColorConstantColor();
      
        //create the actual zone:
        zoneEntityRef.current?.tryCreatePolygon();
        
        // if there is a visul polygon, we hide him (for comfort)
        zoneEntityRef.current?.showEntity();
    
      };
      const toggleAddingPoints = () => {
        if (isDrawingRef.current) {
          stopAddingPoints();
          return;
        }
        if (!viewerRef.current) return;
    
        // if there is a visul polygon, we hide him (for comfort)
        zoneEntityRef.current?.hideEntity();
    
        const viewer = viewerRef.current;
        setIsDrawing(true);
        isDrawingRef.current = true;
    
        zonePolylineRef.current?.createPolyline();
        zonePolylineRef.current?.createClosingPolyline();
    
        // Set the closing polyline to *transparent* red
        zonePolylineRef.current?.setColorTransparentColor();
        if (zoneRef.current.points.length > 0) {
          const lastPoint = zoneRef.current.points[zoneRef.current.points.length - 1];
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
            ...zoneRef.current,
            points: [...zoneRef.current.points, newPoint],
          };
          setZone(newZone);
          zoneRef.current = newZone; 
    
    
          // update where needed
          zonePolylineRef.current?.addPoint(newPoint);
          zoneEntityRef.current?.UpdateZonePositions([...zoneRef.current.points])
    
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
          zonePolylineRef.current?.setColorConstantColor();
    
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    
        handler.setInputAction((movement: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
          if (!lastPointRef.current) return;
    
          const newPosition = viewer.scene.pickPosition(movement.endPosition);
          if (!Cesium.defined(newPosition)) return;
    
          // Set the closing polyline to *transparent* red
          zonePolylineRef.current?.setColorTransparentColor();
    
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
          const zoneOptions = ZoneOptionsManager.getZoneOptionsByString(zone.zoneType);
          const color = zoneOptions!.color;
          tempLineRef.current = viewerRef.current!.entities.add({
            polyline: {
              positions: new Cesium.CallbackProperty(() => {
                if (!lastPointRef.current || !currentMousePositionRef.current) return undefined;
                return [lastPointRef.current, currentMousePositionRef.current];
              }, false),
              width: 3,
              material: color,
            },
          });
        }
      }
    
      const tryCreateTempClosingLine = () =>{
        // closing line (first point -> mouse)
        if (zoneRef.current.points.length > 0) {
          const firstPoint = zoneRef.current.points[0];
          const firstCartesian = Cesium.Cartesian3.fromDegrees(
            firstPoint.longitude,
            firstPoint.latitude,
            firstPoint.altitude
          );
    
          if (!tempClosingLineRef.current) {
            const zoneOptions = ZoneOptionsManager.getZoneOptionsByString(zone.zoneType);
            const color = zoneOptions!.color;
            tempClosingLineRef.current = viewerRef.current!.entities.add({
              polyline: {
                positions: new Cesium.CallbackProperty(() => {
                  if (!currentMousePositionRef.current) return undefined;
                  return [firstCartesian, currentMousePositionRef.current];
                }, false),
                width: 3,
                material: color,
              },
            });
          }
        }
      }
    
      const handleInputChange = (field: keyof DangerZone, value: any) => {
        const newZone = { ...zone, [field]: value }
        setZone(newZone);
        zoneRef.current = newZone;
        switch (field) {
          case "bottomHeight":
            zoneEntityRef.current?.UpdateZoneBottomHeight(value); // update the 3D polygon bottomHeight
            break;
          case "topHeight":
            zoneEntityRef.current?.UpdateZoneTopHeight(value); // update the 3D polygon topHeight
            break;
          case "zoneName":
            zoneEntityRef.current?.UpdateZoneName(value); // update the 3D polygon name
            break;
        }
      };
    
      return (
        <div>
          <div className="zone-content">
            <input
              type="text"
              placeholder="Zone Name"
              className="zone-name-input"
              value={zone.zoneName}
              onChange={(e) => handleInputChange("zoneName", e.target.value)}
            />
    
            <div className="zone-fields">
              <label>
                Bottom Height (m):
                <input
                  type="number"
                  value={zone.bottomHeight}
                  onChange={(e) => handleInputChange("bottomHeight", Number(e.target.value))}
                />
              </label>
              <label>
                Top Height (m):
                <input
                  type="number"
                  value={zone.topHeight}
                  onChange={(e) => handleInputChange("topHeight", Number(e.target.value))}
                />
              </label>
            </div>
            
            <div className="zone-fields">
                <label>
                    Zone Type:
                    <select  className="zone-select"  value={zoneType} onChange={(e) => handleZoneTypeChange(e.target.value)}>
                    <option value={"Danger"}>Danger</option>
                    <option value={"Jam"}>Jam</option>
                    </select>
                </label>
            </div>
            {zoneType === ZoneTypeEnum.Danger && (
                <CreateDangerZonePanel viewerRef={viewerRef} zone={zone as DangerZone} setZone={setZone} />
              )}

            {zoneType === ZoneTypeEnum.Jam && (
                <CreateJamZonePanel viewerRef={viewerRef} zone={zone as JamZone} setZone={setZone} />
            )}

    
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
                  {zone.points.map((p, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>
                        <input
                          type="number"
                          value={p.longitude}
                          step="0.000001"
                          onChange={(e) =>
                            handleZonePointChange(idx, "longitude", Number(e.target.value))
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={p.latitude}
                          step="0.000001"
                          onChange={(e) =>
                            handleZonePointChange(idx, "latitude", Number(e.target.value))
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
    
            <div className="zone-actions">
              <button className="save-button" onClick={() => 
                  {
                    zonePolylineRef.current?.remove()
                    zoneEntityRef.current?.RemoveEntity();
                    zoneEntityRef.current?.SetEntityNull();
                    onSave(zone)
                    onClose()
                  }
                }>
                  Save
              </button>
              <button className="cancel-button" onClick={() =>
                  {
                    zonePolylineRef.current?.remove()
                    zoneEntityRef.current?.RemoveEntity();
                    zoneEntityRef.current?.SetEntityNull();
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
