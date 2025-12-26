// Handles shooting and related logic
import * as Cesium from 'cesium';
import { Viewer, Cartesian3 } from 'cesium';
import type { GeoPoint, CreateBullet } from '../../Messages/AllTypes';
import { C2SMessageType } from '../../Messages/C2SMessageType';

export class InitBulletShooting {
    private static instance: InitBulletShooting | null = null;
    private viewer: Viewer;
    private maxDistance: number;
    private handler: Cesium.ScreenSpaceEventHandler | undefined;
    private keyboardHandler: ((e: KeyboardEvent) => void) | undefined;
    private send: (type: string, data: any) => void;
    private droneId: string;
    private cooldown: number = 1000; // milliseconds
    private lastShotTime: number = 0;

    private constructor(viewer: Viewer, send: (type: string, data: any) => void, droneId: string, maxDistance: number = 1000) {
        this.viewer = viewer;
        this.send = send;
        this.droneId = droneId;
        this.maxDistance = maxDistance;
    }

    public static getInstance(viewer?: Viewer, send?: (type: string, data: any) => void, droneId?: string, maxDistance: number = 3000): InitBulletShooting {
        if (!InitBulletShooting.instance) {
            if (!viewer || !send || !droneId) {
                throw new Error('Viewer, send, and droneId must be provided for the first getInstance call');
            }
            InitBulletShooting.instance = new InitBulletShooting(viewer, send, droneId, maxDistance);
        }
        return InitBulletShooting.instance;
    }

    public initShootingHandler() {
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        // Shoot on left click
        this.handler.setInputAction(() => {
            this.tryShoot();
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        // Make canvas focusable for key events
        const canvas = this.viewer.scene.canvas;
        canvas.tabIndex = 0;
        // Focus canvas on mouse enter or click
        canvas.addEventListener('mouseenter', () => canvas.focus());
        canvas.addEventListener('mousedown', () => canvas.focus());

        // Helper to handle shooting and shortcut prevention
        this.keyboardHandler = (e: KeyboardEvent) => {
            // Fire on F key (not interfering with movement keys)
            if ((e.key === 'f' || e.key === 'F') && !e.repeat) {
                this.tryShoot();
            }
        };
        window.addEventListener('keydown', this.keyboardHandler, true);
        window.addEventListener('keyup', this.keyboardHandler, true);
    }
    // Try to shoot, respecting cooldown
    private tryShoot() {
        const now = Date.now();
        if (now - this.lastShotTime >= this.cooldown) {
            this.lastShotTime = now;
            this.calculateStartAndEndAndSend();
        }
    }

    private calculateStartAndEndAndSend() {
        const camera = this.viewer.camera;
        const startPosition = Cartesian3.clone(camera.positionWC);
        const direction = Cartesian3.clone(camera.directionWC);
        const scaledDirection = Cartesian3.multiplyByScalar(direction, this.maxDistance, new Cartesian3());
        const endPosition = Cartesian3.add(startPosition, scaledDirection, new Cartesian3());

        // Convert Cartesian3 to GeoPoint
        const startCarto = Cesium.Cartographic.fromCartesian(startPosition);
        const endCarto = Cesium.Cartographic.fromCartesian(endPosition);
        const startGeo: GeoPoint = {
            longitude: Cesium.Math.toDegrees(startCarto.longitude),
            latitude: Cesium.Math.toDegrees(startCarto.latitude),
            altitude: startCarto.height
        };
        const endGeo: GeoPoint = {
            longitude: Cesium.Math.toDegrees(endCarto.longitude),
            latitude: Cesium.Math.toDegrees(endCarto.latitude),
            altitude: endCarto.height
        };

        const createBullet: CreateBullet = {
            droneId: this.droneId,
            bulletId: "",
            startPosition: startGeo,
            endPosition: endGeo
        };
        this.send(C2SMessageType.CreateBullet, createBullet);
    }

    destroy() {
        if (this.handler) {
            this.handler.destroy();
        }
        const canvas = this.viewer.scene.canvas;
        if (this.keyboardHandler) {
            canvas.removeEventListener('keydown', this.keyboardHandler);
            window.removeEventListener('keydown', this.keyboardHandler);
        }
    }
}
