// DroneKilledHandler.ts
import { hideDrone, setDroneToDefaultPositionAndOrientation, showDrone } from "./RespawnUtil";
import { RESPAWN_TIME_SEC } from "./DroneRespawnConfig";
import { DroneEntityManager } from "../../Drones/DroneEntityManager";
import type { DroneKilled } from "../../../Messages/AllTypes";

export class DroneKilledHandler {
    private static instance: DroneKilledHandler | null = null;
    private readonly droneEntityManager: DroneEntityManager | null = DroneEntityManager.getInstance();
    private myDroneId: string | null;
    private setIsAlive: ((alive: boolean) => void) | null;
    private setKillerName: ((name?: string) => void) | null;
    private setRespawnSeconds: ((seconds: number) => void) | null;
    private shootingCleanup: (() => void) | null = null;
    private controllerCleanup: (() => void) | null = null;
    private initShootingAndController: (() => void) | null = null;

    private constructor(
        myDroneId: string,
        setIsAlive: (alive: boolean) => void,
        setKillerName: (name?: string) => void,
        setRespawnSeconds: (seconds: number) => void,
        shootingCleanup?: (() => void),
        controllerCleanup?: (() => void),
        initShootingAndController?: (() => void)
    ) {
    this.myDroneId = myDroneId;
    this.setIsAlive = setIsAlive;
    this.setKillerName = setKillerName;
    this.setRespawnSeconds = setRespawnSeconds;
    this.shootingCleanup = shootingCleanup || null;
    this.controllerCleanup = controllerCleanup || null;
    this.initShootingAndController = initShootingAndController || null;
    }

    public static getInstance(
        myDroneId: string,
        setIsAlive: (alive: boolean) => void,
        setKillerName: (name?: string) => void,
        setRespawnSeconds: (seconds: number) => void,
        shootingCleanup?: (() => void),
        controllerCleanup?: (() => void),
        initShootingAndController?: (() => void)
    ): DroneKilledHandler {
        if (!DroneKilledHandler.instance) {
            DroneKilledHandler.instance = new DroneKilledHandler(
                myDroneId,
                setIsAlive,
                setKillerName,
                setRespawnSeconds,
                shootingCleanup,
                controllerCleanup,
                initShootingAndController
            );
        }
        return DroneKilledHandler.instance;
    }

    public handleKilledDrone(data: any) {
        // Parse data to DroneKilled
        const droneKilled = data as DroneKilled;
        if (!this.droneEntityManager) return;
        if (droneKilled.killedDroneId === this.myDroneId) {
            // My drone killed
            this.cleanupShootingAndController();
            this.setIsAlive?.(false);
            this.setKillerName?.(droneKilled.killerDroneId);
            this.setRespawnSeconds?.(RESPAWN_TIME_SEC);
            const entity = this.droneEntityManager.getDroneEntity(droneKilled.killedDroneId);
            if (entity) hideDrone(entity);
        } else {
            // Another drone killed
            const entity = this.droneEntityManager.getDroneEntity(droneKilled.killedDroneId);
            if (entity) {
                this.droneEntityManager.removeDrone(droneKilled.killedDroneId);
            }
        }
    }

    public respawnMyDrone() {
        if (!this.droneEntityManager || !this.myDroneId) return;
        const entity = this.droneEntityManager.getDroneEntity(this.myDroneId);
        if (entity) {
            showDrone(entity);
            // Set default position and orientation
            setDroneToDefaultPositionAndOrientation(entity);
        }
        this.setIsAlive?.(true);
        // Re-init controller and shooting
        if (this.initShootingAndController) {
            this.initShootingAndController();
        }
    }

    public cleanupShootingAndController() {
        if (this.shootingCleanup) {
            this.shootingCleanup();
            console.log("Shooting cleanup done.");
        }
        if (this.controllerCleanup) {
            this.controllerCleanup();
            console.log("Controller cleanup done.");
        }
    }

    public setCleanupAndInit(
        shootingCleanup: (() => void),
        controllerCleanup: (() => void),
        initShootingAndController: (() => void)
    ) {
        this.shootingCleanup = shootingCleanup;
        this.controllerCleanup = controllerCleanup;
        this.initShootingAndController = initShootingAndController;
    }
}

