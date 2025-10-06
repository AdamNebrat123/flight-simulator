// Handles shooting and related logic
import * as Cesium from 'cesium';
import { Viewer, Cartesian3 } from 'cesium';

export class ShootingMechanics {
    private viewer: Viewer;
    private maxDistance: number;
    private handler: Cesium.ScreenSpaceEventHandler | undefined;

    constructor(viewer: Viewer, maxDistance: number = 1000) {
        this.viewer = viewer;
        this.maxDistance = maxDistance;
        this.initMouseHandler();
    }

    private initMouseHandler() {
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.handler.setInputAction(() => {
            this.calculateStartAndEnd();
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    private calculateStartAndEnd() {
        const camera = this.viewer.camera;
        const startPosition = Cartesian3.clone(camera.positionWC);
        const direction = Cartesian3.clone(camera.directionWC);
        const scaledDirection = Cartesian3.multiplyByScalar(direction, this.maxDistance, new Cartesian3());
        const endPosition = Cartesian3.add(startPosition, scaledDirection, new Cartesian3());
        console.log('Start Position:', startPosition);
        console.log('End Position:', endPosition);
    }

    destroy() {
        if (this.handler) {
            this.handler.destroy();
        }
    }
}
