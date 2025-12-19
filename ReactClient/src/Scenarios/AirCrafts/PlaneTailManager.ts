import * as Cesium from 'cesium';
import type { TrajectoryPoint } from '../../Messages/AllTypes';

export class PlaneTailManager {
  private static instance: PlaneTailManager | null = null;

  private viewer: Cesium.Viewer | null = null;
  private segmentTails = new Map<string, Cesium.Entity[]>();
  private tailHistories = new Map<string, TrajectoryPoint[]>();
  private maxTailPoints: number;

  private constructor(viewer?: Cesium.Viewer, maxTailPoints = 30) {
    this.viewer = viewer ?? null;
    this.maxTailPoints = maxTailPoints;
  }

  public static getInstance(viewer?: Cesium.Viewer, maxTailPoints = 30): PlaneTailManager {
    if (!PlaneTailManager.instance) {
      PlaneTailManager.instance = new PlaneTailManager(viewer, maxTailPoints);
    } else if (viewer) {
      // Update viewer if provided
      PlaneTailManager.instance.setViewer(viewer);
    }
    return PlaneTailManager.instance;
  }

  setViewer(viewer: Cesium.Viewer) {
    this.viewer = viewer;
  }

  updateTail(planeName: string, tailPoints: TrajectoryPoint[]) {
    if (!this.viewer || tailPoints.length < 2) return;

    const history = tailPoints.slice(-this.maxTailPoints);
    this.tailHistories.set(planeName, history);

    if (!this.segmentTails.has(planeName)) {
      this.segmentTails.set(planeName, []);
    }
    const segments = this.segmentTails.get(planeName)!;

    while (segments.length < history.length - 1) {
      const segment = this.viewer.entities.add({
        polyline: {
          width: 3,
          positions: new Cesium.CallbackProperty(() => {
            const h = this.tailHistories.get(planeName);
            if (!h || h.length < 2) return null;
            const idx = segments.indexOf(segment);
            if (idx >= h.length - 1) return null;
            return [
              Cesium.Cartesian3.fromDegrees(h[idx].position.longitude, h[idx].position.latitude, h[idx].position.altitude),
              Cesium.Cartesian3.fromDegrees(h[idx + 1].position.longitude, h[idx + 1].position.latitude, h[idx + 1].position.altitude)
            ];
          }, false),
          material: new Cesium.ColorMaterialProperty(Cesium.Color.SKYBLUE.withAlpha(1.0))
        }
      });
      segments.push(segment);
    }

    for (let i = 0; i < segments.length; i++) {
      const alpha = (i + 1) / segments.length;
      segments[i].polyline!.material = new Cesium.ColorMaterialProperty(Cesium.Color.SKYBLUE.withAlpha(alpha));
    }

    while (segments.length > history.length - 1) {
      const e = segments.pop();
      if (e) this.viewer.entities.remove(e);
    }
  }

  clearAllTails() {
    if (!this.viewer) return;

    for (const segments of this.segmentTails.values()) {
      segments.forEach(seg => this.viewer!.entities.remove(seg));
    }
    this.segmentTails.clear();
    this.tailHistories.clear();
  }
}
