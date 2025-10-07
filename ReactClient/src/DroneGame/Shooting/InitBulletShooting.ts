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
    private send: (type: string, data: any) => void;
    private droneId: string;

    private constructor(viewer: Viewer, send: (type: string, data: any) => void, droneId: string, maxDistance: number = 1000) {
        this.viewer = viewer;
        this.send = send;
        this.droneId = droneId;
        this.maxDistance = maxDistance;
        this.initMouseHandler();
    }

    public static getInstance(viewer?: Viewer, send?: (type: string, data: any) => void, droneId?: string, maxDistance: number = 1000): InitBulletShooting {
        if (!InitBulletShooting.instance) {
            if (!viewer || !send || !droneId) {
                throw new Error('Viewer, send, and droneId must be provided for the first getInstance call');
            }
            InitBulletShooting.instance = new InitBulletShooting(viewer, send, droneId, maxDistance);
        }
        return InitBulletShooting.instance;
    }

    private initMouseHandler() {
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.handler.setInputAction(() => {
            this.calculateStartAndEndAndSend();
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
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
    }
}
