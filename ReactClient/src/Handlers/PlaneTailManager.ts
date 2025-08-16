import * as Cesium from 'cesium';
import type { TrajectoryPoint } from '../Messages/AllTypes';

export class PlaneTailManager {
    private viewer: Cesium.Viewer;
    private segmentTails = new Map<string, Cesium.Entity[]>();
    private tailHistories = new Map<string, TrajectoryPoint[]>();
    private maxTailPoints: number;

    constructor(viewer: Cesium.Viewer, maxTailPoints = 30) {
        this.viewer = viewer;
        this.maxTailPoints = maxTailPoints;
    }

    updateTail(planeName: string, tailPoints: TrajectoryPoint[]) {
        if (tailPoints.length < 2) return;

        // Keep only last maxTailPoints
        const history = tailPoints.slice(-this.maxTailPoints);
        this.tailHistories.set(planeName, history);

        // Prepare segments array
        if (!this.segmentTails.has(planeName)) {
            this.segmentTails.set(planeName, []);
        }
        const segments = this.segmentTails.get(planeName)!;

        // Create missing segments
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
                            Cesium.Cartesian3.fromDegrees(
                                h[idx].position.longitude,
                                h[idx].position.latitude,
                                h[idx].position.altitude
                            ),
                            Cesium.Cartesian3.fromDegrees(
                                h[idx + 1].position.longitude,
                                h[idx + 1].position.latitude,
                                h[idx + 1].position.altitude
                            )
                        ];
                    }, false),
                    material: new Cesium.ColorMaterialProperty(
                        Cesium.Color.SKYBLUE.withAlpha(1.0)
                    )
                }
            });
            segments.push(segment);
        }

        // Update colors dynamically
        for (let i = 0; i < segments.length; i++) {
            const alpha = (i + 1) / segments.length; // oldest faint, newest bright
            const color = Cesium.Color.SKYBLUE.withAlpha(alpha);
            segments[i].polyline!.material = new Cesium.ColorMaterialProperty(color);
        }

        // Remove excess segments if history shrank
        while (segments.length > history.length - 1) {
            const e = segments.pop();
            if (e) this.viewer.entities.remove(e);
        }
    }

    clearAllTails() {
        for (const segments of this.segmentTails.values()) {
            segments.forEach(seg => this.viewer.entities.remove(seg));
        }
        this.segmentTails.clear();
        this.tailHistories.clear();
    }
}
