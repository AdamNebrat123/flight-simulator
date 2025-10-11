import { useEffect, useRef } from "react";
import * as Cesium from "cesium";
import { DroneHandler } from "../Drones/DroneHandler";

interface MinimapProps {
  viewer: Cesium.Viewer; // The main Cesium viewer
  myDroneId: string;
}

export default function Minimap({ viewer, myDroneId }: MinimapProps) {
  const minimapDivRef = useRef<HTMLDivElement>(null);
  const minimapViewerRef = useRef<Cesium.Viewer | null>(null);
  const droneEntitiesRef = useRef<Record<string, Cesium.Entity>>({});
  const tileListenerRemoverRef = useRef<Cesium.Event.RemoveCallback | null>(null);

  useEffect(() => {
    if (!minimapDivRef.current) return;

    const baseImagery = viewer.imageryLayers.get(0)?.imageryProvider;

    const initializeMinimap = async () => {
      if (!minimapDivRef.current) return;

      // --- Create the minimap viewer ---
      const minimapViewer = new Cesium.Viewer(minimapDivRef.current!, {
        animation: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        navigationHelpButton: false,
        shouldAnimate: false,
        skyBox: false,
        skyAtmosphere: false,
        shadows: false,
        terrainProvider: viewer.terrainProvider,
        useDefaultRenderLoop: true,
        contextOptions: {
          webgl: {
            alpha: true,
            depth: true,
            stencil: true,
            antialias: true,
            preserveDrawingBuffer: false,
          },
        },
      });

      minimapViewerRef.current = minimapViewer;

      // --- Set 2.5D Columbus View ---
      minimapViewer.scene.mode = Cesium.SceneMode.COLUMBUS_VIEW;
      minimapViewer.scene.screenSpaceCameraController.enableTilt = false;
      minimapViewer.scene.screenSpaceCameraController.enableLook = false;
      minimapViewer.scene.screenSpaceCameraController.enableRotate = false;
      minimapViewer.scene.screenSpaceCameraController.enableZoom = true;

      // --- Add base imagery provider (clone if possible) ---
      minimapViewer.imageryLayers.removeAll();
      if (baseImagery) {
        let provider: Cesium.ImageryProvider;
        if ((baseImagery as any).constructor.prototype.clone) {
          provider = (baseImagery as any).constructor.prototype.clone(baseImagery);
        } else {
          provider = baseImagery;
        }
        minimapViewer.imageryLayers.addImageryProvider(provider);
      }

      // --- Determine initial camera target ---
      const droneHandler = DroneHandler.getInstance();
      const myDrone = droneHandler.getDroneEntity(myDroneId);
      const CAMERA_HEIGHT_METERS = 2000;

      let targetPosition = Cesium.Cartesian3.ZERO;
      if (myDrone?.position) {
        const initialPos = myDrone.position.getValue(viewer.clock.currentTime);
        if (initialPos) targetPosition = initialPos;
      }

      // --- Force first camera render ---
      minimapViewer.camera.lookAt(
        targetPosition,
        new Cesium.HeadingPitchRange(0, -Cesium.Math.PI_OVER_TWO, CAMERA_HEIGHT_METERS)
      );
      minimapViewer.scene.requestRender();

      // --- Wait for tiles to load (or timeout) ---
      await new Promise<void>((resolve) => {
        let resolved = false;
        const removeTileListener = minimapViewer.scene.globe.tileLoadProgressEvent.addEventListener(
          (queued: number) => {
            if (!resolved && queued <= 1) {
              removeTileListener();
              resolved = true;
              resolve();
            }
          }
        );
        tileListenerRemoverRef.current = removeTileListener;

        setTimeout(() => {
          if (!resolved) {
            tileListenerRemoverRef.current?.();
            resolved = true;
            resolve();
          }
        }, 5000);
      });

      if (!minimapViewerRef.current) return;

      // --- Drone tracking logic ---
      const droneEntities = droneEntitiesRef.current;

      const updateDrones = () => {
        if (minimapViewer.isDestroyed()) return;

        minimapViewer.clock.currentTime = viewer.clock.currentTime;
        const allDroneIds = droneHandler.getAllDroneIds?.() || [];
        const myDroneEntity = droneHandler.getDroneEntity(myDroneId);

        // --- Camera tracking ---
        if (myDroneEntity?.position) {
          const myDronePos = myDroneEntity.position.getValue(minimapViewer.clock.currentTime);
          if (myDronePos) {
            const cartographic = Cesium.Cartographic.fromCartesian(myDronePos);
            const destination = Cesium.Cartesian3.fromDegrees(
              Cesium.Math.toDegrees(cartographic.longitude),
              Cesium.Math.toDegrees(cartographic.latitude),
              cartographic.height + CAMERA_HEIGHT_METERS
            );
            minimapViewer.camera.setView({
              destination,
              orientation: {
                heading: 0,
                pitch: -Cesium.Math.PI_OVER_TWO,
                roll: 0,
              },
            });
          }
        }

        // --- Update or create drone entities ---
        const currentIds = new Set(allDroneIds.concat(myDroneId));

        // Remove old entities
        for (const id in droneEntities) {
          if (!currentIds.has(id)) {
            minimapViewer.entities.remove(droneEntities[id]);
            delete droneEntities[id];
          }
        }

        // Add/update entities
        for (const id of currentIds) {
          const drone = id === myDroneId ? myDroneEntity : droneHandler.getDroneEntity(id);
          if (!drone?.position) continue;
          const pos = drone.position.getValue(minimapViewer.clock.currentTime);
          if (!pos) continue;

          if (!droneEntities[id]) {
            const entity = minimapViewer.entities.add({
              position: new Cesium.ConstantPositionProperty(pos),
              point: {
                pixelSize: id === myDroneId ? 8 : 5,
                color: id === myDroneId ? Cesium.Color.LIME : Cesium.Color.RED,
                outlineWidth: 2,
                outlineColor:  id === myDroneId ? Cesium.Color.WHITE : Cesium.Color.WHITE,
                heightReference: Cesium.HeightReference.NONE,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
              },
            });
            droneEntities[id] = entity;
          } else {
            (droneEntities[id].position as Cesium.ConstantPositionProperty).setValue(pos);
          }
        }
      };

      const removeListener = minimapViewer.scene.preRender.addEventListener(updateDrones);

      return () => {
        removeListener();
        minimapViewer.destroy();
        minimapViewerRef.current = null;
        droneEntitiesRef.current = {};
      };
    };

    // --- Delay initialization to ensure DOM is ready ---
    const timer = setTimeout(() => initializeMinimap(), 0);

    return () => {
      clearTimeout(timer);
      tileListenerRemoverRef.current?.();
      tileListenerRemoverRef.current = null;
    };
  }, [viewer, myDroneId]);

  return (
    <div
      style={{
        position: "absolute",
        top: 5,
        right: 5,
        width: 200,
        height: 200,
        border: "2px solid white",
        borderRadius: 5,
        overflow: "hidden",
        zIndex: 10,
      }}
    >
      <div ref={minimapDivRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
