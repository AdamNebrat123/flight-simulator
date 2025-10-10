
import { useState, useRef, useEffect } from "react";
import * as Cesium from "cesium";
import DroneGameViewer from "./DroneGameViewer";
import { InitBulletShooting } from "./Shooting/InitBulletShooting";
import { BulletHandler } from "./Shooting/BulletHandler";
import { initDroneController } from "./Drones/DroneController";
import { initFirstPersonCameraLock } from "./Drones/FirstPersonCameraLock";
import { DroneHandler } from "./Drones/DroneHandler";
import { useWebSocket } from "../WebSocket/WebSocketProvider";
import { S2CMessageType } from "../Messages/S2CMessageType";
import { C2SMessageType } from "../Messages/C2SMessageType";
import { Crosshair } from "./UI/Crosshair";
import DroneDeathOverlay from "./GameLogic/Respawn/DroneDeathOverlay";
import { RESPAWN_TIME_SEC } from "./GameLogic/Respawn/DroneRespawnConfig";
import { DroneKilledHandler } from "./GameLogic/Respawn/DroneKilledHandler";
import { CreateArena } from "./Arena/CreateArena";
import TouchControls from "./UI/TouchControls";
import type { DroneWithControls } from "./Drones/DroneTypes";
import KillIndicator from "./UI/KillIndicator";
import type { DroneKilled } from "../Messages/AllTypes";

export default function DroneGame() {
    const [viewer, setViewer] = useState<Cesium.Viewer | null>(null);
    const [isAlive, setIsAlive] = useState(true);
    const [killerName, setKillerName] = useState<string | undefined>(undefined);
    const [respawnSeconds, setRespawnSeconds] = useState(RESPAWN_TIME_SEC); // default, can be set from config
    const [showKillIndicator, setShowKillIndicator] = useState(false);
    const droneRef = useRef<Cesium.Entity | null>(null);
    const cameraCleanupRef = useRef<(() => void) | null>(null);
    const controllerCleanupRef = useRef<(() => void) | null>(null);
    const droneHandlerRef = useRef<DroneHandler | null>(null);
    const shootingRef = useRef<InitBulletShooting | null>(null);
    const bulletHandlerRef = useRef<BulletHandler | null>(null);
    const killedHandlerRef = useRef<DroneKilledHandler | null>(null);
    const arenaEntityRef = useRef<Cesium.Entity | null>(null);
    const { send, on } = useWebSocket();

    // Initialize DroneHandler when viewer is ready and request initial drone data
    useEffect(() => {
        if (!viewer) return;
        droneHandlerRef.current = DroneHandler.getInstance(viewer); // initialize DroneHandler
        bulletHandlerRef.current = BulletHandler.getInstance(viewer); // initialize BulletHandler
        send(C2SMessageType.RequestDroneInitData, {});
    }, [viewer]);

    // Setup my drone: controller + camera
    const setupMyDrone = () => {
        
        console.log("Setting up my drone:", droneRef.current);
        // Only clean up previous controller/shooting for my drone
        if (controllerCleanupRef.current) controllerCleanupRef.current();
        if (cameraCleanupRef.current) cameraCleanupRef.current();

        // init controller and shooting
        initControllerAndShooting();
        
        // Init camera
        cameraCleanupRef.current = initFirstPersonCameraLock({
            viewer: viewer!,
            target: droneRef.current!,
        });
    };

    const setUpController = () => {
        // Init controller
        controllerCleanupRef.current = initDroneController({
            viewer: viewer!,
            send,
            drone: droneRef.current!,
            arrowSensitivityDeg: 1,
            pitchSensitivityDeg: 1,
            rollSensitivityDeg: 4,
            maxSpeed: 40,
            acceleration: 32,
        });
    };

    const setUpShooting = () => {
        shootingRef.current = InitBulletShooting.getInstance(viewer!, send, droneRef.current!.id);
        shootingRef.current.initShootingHandler();
    }

    const controllerCleanup = () => {
        if (controllerCleanupRef.current) {
            controllerCleanupRef.current();
            controllerCleanupRef.current = null;
        }
    }

    const shootingCleanup = () => {
        if (shootingRef.current) {
            shootingRef.current.destroy();
            shootingRef.current = null;
        }
    }

    const initControllerAndShooting = () => {
        setUpController();
        console.log("Setting up controller");
        setUpShooting();
        console.log("Setting up shooting");
        
    }

    // WebSocket handlers
    useEffect(() => {
        if (!droneHandlerRef.current || !viewer) return;

        arenaEntityRef.current = CreateArena(viewer);
        const handleDroneInitData = (data: any) => {
            const myDroneId = droneHandlerRef.current?.HandleDronesInitData(data);
            if (!myDroneId) return;

            // Create DroneKilledHandler instance
            if (!killedHandlerRef.current) {
                killedHandlerRef.current = DroneKilledHandler.getInstance(
                    myDroneId,
                    setIsAlive,
                    setKillerName,
                    setRespawnSeconds,
                    controllerCleanup,
                    shootingCleanup,
                    initControllerAndShooting
                );
            }

            if (!droneRef.current) {
                const entity = droneHandlerRef.current?.getDroneEntity(myDroneId);
                if (entity) {
                    droneRef.current = entity;
                    setupMyDrone();
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
        const handleKilledDrone = (data: any) => {
            killedHandlerRef.current?.handleKilledDrone(data);
            const droneKilled = data as DroneKilled;
            if (droneRef.current && droneKilled.killerDroneId === droneRef.current.id) {
                console.log("Showing kill indicator - we killed someone!");
                setShowKillIndicator(true);
            } 
        };

        const unsubInit = on(S2CMessageType.DroneInitData, handleDroneInitData);
        const unsubRemoveDrone = on(S2CMessageType.RemoveDrone, handleRemoveDrone);
        const unsubUpdateDrone = on(S2CMessageType.UpdateDrone, handleUpdateDrone);
        const unsubDroneError = on(S2CMessageType.DroneError, handleDroneError);
        const unsubBulletsMsg = on(S2CMessageType.BulletsMsg, handleBulletsMsg);
        const unsubDroneKilled = on(S2CMessageType.DroneKilled, handleKilledDrone);

        return () => {
            unsubInit();
            unsubRemoveDrone();
            unsubUpdateDrone();
            
            unsubDroneError();
            unsubBulletsMsg();
            unsubDroneKilled();
            controllerCleanupRef.current?.();
            bulletHandlerRef.current?.clearAllBullets();
            bulletHandlerRef.current = null;
            viewer.entities.remove(arenaEntityRef.current!);
        };
    }, [viewer]);


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

    const handleKeyStateChange = (key: string, isPressed: boolean) => {
        if (droneRef.current && (droneRef.current as DroneWithControls).handleKeyStateChange) {
            (droneRef.current as DroneWithControls).handleKeyStateChange(key, isPressed);
        }
    };

    return (
        <div style={{ width: "100%", height: "100vh", position: "relative" }}>
            <DroneGameViewer onViewerReady={setViewer} />
            <Crosshair />
            {!isAlive && (
                <DroneDeathOverlay
                    killerName={killerName}
                    respawnSeconds={respawnSeconds}
                    setIsAlive={setIsAlive}
                    onRespawn={() => killedHandlerRef.current?.respawnMyDrone()}
                />
            )}
            <TouchControls onKeyStateChange={handleKeyStateChange} />
            <KillIndicator 
                showDuration={750}
                isVisible={showKillIndicator}
                onHide={() => setShowKillIndicator(false)}
            />
        </div>
    );
}