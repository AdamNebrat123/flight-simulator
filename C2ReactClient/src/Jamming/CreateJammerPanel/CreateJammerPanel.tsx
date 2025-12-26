import { useEffect, useRef, useState } from "react";
import * as Cesium from "cesium";
import "./CreateJammerPanel.css";
import type { Jammer } from "../Jammer/Jammer";
import type { GeoPoint } from "../../Messages/AllTypes";
import { Frequency } from "../Jammer/JammerRelatedEnums";
import { JammerEntity } from "../EntitiesManagment/JammerEntity";
import { ZoneManager } from "../../Zones/ZoneManager";
import { toast } from "react-toastify";

interface Props {
  viewerRef: React.MutableRefObject<Cesium.Viewer | null>;
  initialJammer: Jammer;
  onSave: (data: Jammer) => void;
  onCancel: () => void;
}

export default function CreateJammerPanel({ viewerRef, initialJammer, onSave, onCancel}: Props) {
  const [jammer, setJammer] = useState<Jammer>(
    JSON.parse(JSON.stringify(initialJammer)) // deep copy
  );

  const [isSelectingPosition, setIsSelectingPosition] = useState(false);
  const handlerRef = useRef<Cesium.ScreenSpaceEventHandler | null>(null);
  const jammerEntityRef = useRef<JammerEntity | null>(null);
  const zoneManagerRef = useRef<ZoneManager | null>(null);
  

  useEffect(() => {
    if (!viewerRef.current) return;
    if (!jammerEntityRef.current) {
        jammerEntityRef.current = new JammerEntity(viewerRef.current, jammer);

    }
    zoneManagerRef.current = ZoneManager.getInstance();
    

    return () => {
      handlerRef.current?.destroy();
      handlerRef.current = null;
    };
  }, []);


  const handleRadiusChange = (value: number) => {
    setJammer(prev => ({...prev, radius: value}) );
    if (jammerEntityRef.current) {
        jammerEntityRef.current.updateRadius(value)
    }

  }

  const handlePositionChange = (newPosition: GeoPoint) => {
    if(!zoneManagerRef.current)
        return;
    const isInAnyZone : boolean =  zoneManagerRef.current.isPointInsideAnyJamZone(newPosition);
    if (isInAnyZone === false){
        toast.error("You can place a jammer only in a JamZone!");
        return;
    }
    setJammer(prev => ({...prev, position: newPosition}) );
    if (jammerEntityRef.current) {
        jammerEntityRef.current.updatePosition(newPosition);
    }
  }

  const startSelectPosition = () => {
    if (!viewerRef.current) return;

    setIsSelectingPosition(true);

    const viewer = viewerRef.current;
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    handler.setInputAction((click: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
      const earthPosition = viewer.scene.pickPosition(click.position);
      if (!Cesium.defined(earthPosition)) return;

      const carto = Cesium.Cartographic.fromCartesian(earthPosition);
      const newPosition: GeoPoint = {
        longitude: Cesium.Math.toDegrees(carto.longitude),
        latitude: Cesium.Math.toDegrees(carto.latitude),
        altitude: carto.height,
      };

      handlePositionChange(newPosition);

      handler.destroy();
      handlerRef.current = null;
      setIsSelectingPosition(false);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    handlerRef.current = handler;
  };

  const stopSelectPosition = () => {
    if (viewerRef.current){
        handlerRef.current?.destroy();
        handlerRef.current = null;
    }
    setIsSelectingPosition(false);
  }


  
  const toggleFrequency = (freq: Frequency) => {
    setJammer(prev => {
      const exists = prev.supportedFrequencies.includes(freq);
      return {
        ...prev,
        supportedFrequencies: exists
          ? prev.supportedFrequencies.filter(f => f !== freq)
          : [...prev.supportedFrequencies, freq],
      };
    });
  };

  return (
    <div className="jammer-panel">
      <div className="jammer-content">
        <h2 className="jammer-title">Jammer</h2>

        <button
          className="select-position-button"
          onClick={()=> {
            isSelectingPosition ? stopSelectPosition() : startSelectPosition();
          }}
        >
          {isSelectingPosition ? "Cancel" : "Select Jammer Position"}
        </button>

        {jammer.position && (
          <div className="position-display">
            <div>Lat: {jammer.position.latitude.toFixed(6)}</div>
            <div>Lon: {jammer.position.longitude.toFixed(6)}</div>
          </div>
        )}

        <label className="field">
          Radius (meters):
          <input
            type="number"
            value={jammer.radius}
            onChange={(e) =>
                handleRadiusChange(Number(e.target.value))
            }
          />
        </label>

        <div className="frequencies-section">
          <div className="section-title">Supported Frequencies</div>

          {Object.values(Frequency).map(freq => (
            <label key={freq} className="checkbox-row">
              <input
                type="checkbox"
                checked={jammer.supportedFrequencies.includes(freq)}
                onChange={() => toggleFrequency(freq)}
              />
              {freq}
            </label>
          ))}
        </div>

        {/* Add more fields as necessary */}
      </div>

      <div className="jammer-actions">
        <button
          className="action-button save-button"
          onClick={() => {
            jammerEntityRef?.current?.removeEntities();
            jammerEntityRef.current = null
            onSave(jammer);
        }}
        >
          Save
        </button>
        <button
          className="action-button cancel-button"
          onClick={() => {
            jammerEntityRef?.current?.removeEntities();
            jammerEntityRef.current = null
            onCancel();
          }}
        >
          Cancel
        </button>
      </div>
      <label>RADIUS: {jammer.radius}</label>
      <label>POSITION: {jammer.position?.longitude.toFixed(6)}, {jammer.position?.latitude.toFixed(6)}</label>
      <label>FREQUENCIES: {jammer.supportedFrequencies.join(', ')}</label>
    </div>
  );
}
