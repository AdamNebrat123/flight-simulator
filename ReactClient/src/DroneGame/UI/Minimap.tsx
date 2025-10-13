import { useEffect, useRef } from "react";
import * as Cesium from "cesium";
import { DroneHandler } from "../Drones/DroneHandler";

// Create a canvas with a triangle pointing up
function createTriangleImage(color: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const context = canvas.getContext('2d')!;

  // Draw a longer, slimmer triangle
  context.beginPath();
  context.moveTo(16, 2);    // top point (moved up)
  context.lineTo(8, 28);   // bottom left (moved in)
  context.lineTo(24, 28);   // bottom right (moved in)
  context.closePath();

  // Fill with color
  context.fillStyle = color;
  context.fill();

  // Add white outline
  context.strokeStyle = 'white';
  context.lineWidth = 2;
  context.stroke();

  return canvas;
}

interface MinimapProps {
  viewer: Cesium.Viewer;
  myDroneId: string;
}

export default function Minimap({ viewer, myDroneId }: MinimapProps) {
  const minimapDivRef = useRef<HTMLDivElement>(null);
  const minimapViewerRef = useRef<Cesium.Viewer | null>(null);
  const droneEntitiesRef = useRef<Record<string, Cesium.Entity>>({});
  const tileListenerRemoverRef = useRef<Cesium.Event.RemoveCallback | null>(null);

  const CAMERA_HEIGHT_METERS = 2000;

  // --- Update drones each frame ---
  const updateDrones = () => {
    if (!minimapViewerRef.current || minimapViewerRef.current.isDestroyed()) return;

    const droneHandler = DroneHandler.getInstance();
    minimapViewerRef.current.clock.currentTime = viewer.clock.currentTime;
    const allDroneIds = droneHandler.getAllDroneIds?.() || [];
    const myDroneEntity = droneHandler.getDroneEntity(myDroneId);

    // --- Camera tracking ---
    if (myDroneEntity?.position) {
      const myDronePos = myDroneEntity.position.getValue(minimapViewerRef.current.clock.currentTime);
      if (myDronePos) {
        const cartographic = Cesium.Cartographic.fromCartesian(myDronePos);
        const destination = Cesium.Cartesian3.fromDegrees(
          Cesium.Math.toDegrees(cartographic.longitude),
          Cesium.Math.toDegrees(cartographic.latitude),
          cartographic.height + CAMERA_HEIGHT_METERS
        );
        minimapViewerRef.current.camera.setView({
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
    const droneEntities = droneEntitiesRef.current;
    const currentIds = new Set(allDroneIds.concat(myDroneId));

    // Remove old ones
    for (const id in droneEntities) {
      if (!currentIds.has(id)) {
        minimapViewerRef.current.entities.remove(droneEntities[id]);
        delete droneEntities[id];
      }
    }

    // Add/update drones
    for (const id of currentIds) {
      const drone = id === myDroneId ? myDroneEntity : droneHandler.getDroneEntity(id);
      if (!drone?.position) continue;
      const pos = drone.position.getValue(minimapViewerRef.current.clock.currentTime);
      if (!pos) continue;

      // Get the drone's heading
      const orientation = drone.orientation?.getValue(minimapViewerRef.current.clock.currentTime);
      const heading = orientation ? Cesium.HeadingPitchRoll.fromQuaternion(orientation).heading : 0;
      const fixedHeading = heading + Cesium.Math.toRadians(35); // Adjust so triangle points correctly

      if (!droneEntities[id]) {
        const entity = minimapViewerRef.current.entities.add({
          position: new Cesium.ConstantPositionProperty(pos),
          billboard: {
            image: createTriangleImage(id === myDroneId ? '#00FF00' : '#FF0000'),
            scale: id === myDroneId ? 0.5 : 0.4,
            heightReference: Cesium.HeightReference.NONE,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            rotation: -fixedHeading, // Negative because we want the triangle to point in the heading direction
          },
        });
        droneEntities[id] = entity;
      } else {
        const entity = droneEntities[id];
        (entity.position as Cesium.ConstantPositionProperty).setValue(pos);
        if (entity.billboard) {
          entity.billboard.rotation = new Cesium.ConstantProperty(-fixedHeading);
        }
      }
    }
  };

  // --- Initialize minimap viewer ---
  const initializeMinimap = async (): Promise<Cesium.Viewer | null> => {
    if (!minimapDivRef.current) return null;

    const baseImagery = viewer.imageryLayers.get(0)?.imageryProvider;

    const minimapViewer = new Cesium.Viewer(minimapDivRef.current, {
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

    minimapViewer.scene.mode = Cesium.SceneMode.COLUMBUS_VIEW;
    minimapViewer.scene.screenSpaceCameraController.enableTilt = false;
    minimapViewer.scene.screenSpaceCameraController.enableLook = false;
    minimapViewer.scene.screenSpaceCameraController.enableRotate = false;
    minimapViewer.scene.screenSpaceCameraController.enableZoom = true;

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

    // --- Initial camera setup ---
    const droneHandler = DroneHandler.getInstance();
    const myDrone = droneHandler.getDroneEntity(myDroneId);
    let targetPosition = Cesium.Cartesian3.ZERO;
    if (myDrone?.position) {
      const pos = myDrone.position.getValue(viewer.clock.currentTime);
      if (pos) targetPosition = pos;
    }

    minimapViewer.camera.lookAt(
      targetPosition,
      new Cesium.HeadingPitchRange(0, -Cesium.Math.PI_OVER_TWO, CAMERA_HEIGHT_METERS)
    );
    minimapViewer.scene.requestRender();

    // --- Wait for tiles to load ---
    const globe: any = minimapViewer.scene.globe;

    await new Promise<void>((resolve) => {
        const checkReady = () => {
            if (globe._surface?.tileProvider?.ready && minimapViewer.scene.globe.tilesLoaded) {
            resolve();
            return true;
            }
            return false;
        };

        const interval = setInterval(() => {
            if (checkReady()) clearInterval(interval);
        }, 200);

        setTimeout(() => {
            clearInterval(interval);
            resolve(); // fallback if still not ready
        }, 10000);
    });


    minimapViewerRef.current = minimapViewer;

    return minimapViewer;
  };

  // --- Once minimap is ready, start tracking drones ---
  const onMinimapViewerReady = () => {
    const removeListener = minimapViewerRef.current!.scene.preRender.addEventListener(updateDrones);
    return () => removeListener();
  };

  useEffect(() => {
    if (!minimapDivRef.current) return;

    let cleanupFn: (() => void) | undefined;
    const timer = setTimeout(async () => {
      const minimapViewer = await initializeMinimap();
      if (minimapViewer) {
        cleanupFn = onMinimapViewerReady();
      }
    }, 0);

    return () => {
      clearTimeout(timer);
      cleanupFn?.();
      tileListenerRemoverRef.current?.();
      tileListenerRemoverRef.current = null;
      if (minimapViewerRef.current && !minimapViewerRef.current.isDestroyed()) {
        minimapViewerRef.current.destroy();
        minimapViewerRef.current = null;
      }
      droneEntitiesRef.current = {};
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
