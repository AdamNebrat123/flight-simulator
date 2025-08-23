import * as Cesium from "cesium";
import { PlanePolylineManager } from "./PlanePolylineManager";

export class PlanePolylineInteraction {
  private viewer: Cesium.Viewer;
  private polylineManager: PlanePolylineManager;
  private selectedPlane: string | null = null;
  private handler: Cesium.ScreenSpaceEventHandler;

  constructor(viewer: Cesium.Viewer, polylineManager: PlanePolylineManager) {
    this.viewer = viewer;
    this.polylineManager = polylineManager;
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);

    this.registerClickHandler();
  }

  private registerClickHandler() {
    this.handler.setInputAction((movement: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
      const pickedObject = this.viewer.scene.pick(movement.position);

      if (Cesium.defined(pickedObject) && pickedObject.id) {
        const entity = pickedObject.id as Cesium.Entity;
        if (entity.polyline && entity.name) {
          const planeName = entity.name;

          // Return the old one to CYAN
          if (this.selectedPlane && this.selectedPlane !== planeName) {
            this.polylineManager.setPlanePolylineColorCyan(this.selectedPlane);
          }

          // Color the current one YELLOW
          this.polylineManager.setPlanePolylineColorYellow(planeName);
          this.selectedPlane = planeName;
          return;
        }
      }

      // Click on an empty space -- return the previous one to CYAN
      if (this.selectedPlane) {
        this.polylineManager.setPlanePolylineColorCyan(this.selectedPlane);
        this.selectedPlane = null;
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  destroy() {
    this.handler.destroy();
  }
}
