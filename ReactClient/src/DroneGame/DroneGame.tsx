
import { useState, useRef, useEffect } from "react";
import * as Cesium from "cesium";
import DroneGameViewer from "./DroneGameViewer";
import { InitBulletShooting } from "./Shooting/InitBulletShooting";
import { BulletHandler } from "./Shooting/BulletHandler";
import { initDroneController } from "../FreeFlightMode/DroneController";
import { initFirstPersonCameraLock } from "../FreeFlightMode/FirstPersonCameraLock";
import { DroneHandler } from "../FreeFlightMode/Drones/DroneHandler";
import { useWebSocket } from "../WebSocket/WebSocketProvider";
import { S2CMessageType } from "../Messages/S2CMessageType";
import { C2SMessageType } from "../Messages/C2SMessageType";

export default function DroneGame() {
    const [viewer, setViewer] = useState<Cesium.Viewer | null>(null);
    const droneRef = useRef<Cesium.Entity | null>(null);
    const cameraCleanupRef = useRef<(() => void) | null>(null);
    const controllerCleanupRef = useRef<(() => void) | null>(null);
    const droneHandlerRef = useRef<DroneHandler | null>(null);
    const shootingRef = useRef<InitBulletShooting | null>(null);
    const bulletHandlerRef = useRef<BulletHandler | null>(null);
    const { send, on } = useWebSocket();

    // Initialize DroneHandler when viewer is ready and request initial drone data
    useEffect(() => {
        if (!viewer) return;
        droneHandlerRef.current = DroneHandler.getInstance(viewer); // initialize DroneHandler
        bulletHandlerRef.current = BulletHandler.getInstance(viewer); // initialize BulletHandler
        send(C2SMessageType.RequestDroneInitData, {});
    }, [viewer]);

    // Setup my drone: controller + camera
    const setupMyDrone = (entity: Cesium.Entity) => {
        droneRef.current = entity;

        controllerCleanupRef.current?.();
        cameraCleanupRef.current?.();

        controllerCleanupRef.current = initDroneController({
            viewer: viewer!,
            send,
            drone: entity,
            maxSpeed: 100,
            acceleration: 80,
        });
        cameraCleanupRef.current = initFirstPersonCameraLock({
            viewer: viewer!,
            target: entity,
        });
    };

    const setUpShooting = () => {
        shootingRef.current = InitBulletShooting.getInstance(viewer!, send, droneRef.current!.id); // initialize ShootingMechanics
        shootingRef.current.initMouseHandler();
    }

    // WebSocket handlers
    useEffect(() => {
        if (!droneHandlerRef.current || !viewer) return;

        const handleDroneInitData = (data: any) => {
            const myDroneId = droneHandlerRef.current?.HandleDronesInitData(data);
            if (!myDroneId) return;

            if (!droneRef.current) {
                const entity = droneHandlerRef.current?.getDroneEntity(myDroneId);
                if (entity) {
                    setupMyDrone(entity);
                    setUpShooting();
                }
            }
        };

        const handleRemoveDrone = (data: any) => {
            droneHandlerRef.current?.HandleRemoveDrone(data);
        };

        const handleUpdateDrone = (data: any) => {
            droneHandlerRef.current?.HandleUpdateDrone(data);
        };

        const handleDroneError = (data: any) => {
            droneHandlerRef.current?.HandleDroneError(data);
        };

        const handleBulletsMsg = (data: any) => {
            bulletHandlerRef.current?.handleBulletsMsg(data);
        };

        const unsubInit = on(S2CMessageType.DroneInitData, handleDroneInitData);
        const unsubRemoveDrone = on(S2CMessageType.RemoveDrone, handleRemoveDrone);
        const unsubUpdateDrone = on(S2CMessageType.UpdateDrone, handleUpdateDrone);
        const unsubDroneError = on(S2CMessageType.DroneError, handleDroneError);
        const unsubBulletsMsg = on(S2CMessageType.BulletsMsg, handleBulletsMsg);

        return () => {
            unsubInit();
            unsubRemoveDrone();
            unsubUpdateDrone();
            unsubDroneError();
            unsubBulletsMsg();
            bulletHandlerRef.current?.clearAllBullets();
            bulletHandlerRef.current = null;
        };
    }, [viewer, droneHandlerRef.current]);


    // Cleanup on component unmount
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (droneRef.current) {
                send(C2SMessageType.RemoveDrone, { id: droneRef.current.id });
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            if (droneRef.current) {
                send(C2SMessageType.RemoveDrone, { id: droneRef.current.id });
            }
            controllerCleanupRef.current?.();
            cameraCleanupRef.current?.();
            if (shootingRef.current) {
                shootingRef.current.destroy();
                shootingRef.current = null;
            }
            bulletHandlerRef.current?.clearAllBullets();
            bulletHandlerRef.current = null;
            droneRef.current = null;
            droneHandlerRef.current?.clearAllDrones();
            droneHandlerRef.current = null;
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);

    return (
        <div style={{ width: "100%", height: "100vh", position: "relative" }}>
            <DroneGameViewer onViewerReady={setViewer} />
            {/* Add your game UI or controls here */}
        </div>
    );
}