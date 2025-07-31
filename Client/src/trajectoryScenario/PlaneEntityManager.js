export class PlaneEntityManager {
    constructor() {
        this.viewer = null;
        this.entities = new Map(); // key: plane name, value: Cesium.Entity
    }

    setViewer(viewer) {
        this.viewer = viewer;
    }

    updateOrCreateEntity(planeName, position, headingDegrees, pitchDegrees) {
        if (!this.viewer) return;

        const heading = Cesium.Math.toRadians(headingDegrees);
        const pitch = Cesium.Math.toRadians(pitchDegrees);
        const roll = 0.0;

        const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
        const orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);

        if (this.entities.has(planeName)) {
            const entity = this.entities.get(planeName);
            entity.position = position;
            entity.orientation = orientation;
        } else {
            const entity = this.viewer.entities.add({
                position: position,
                orientation: orientation,
                model: {
                    uri: "https://raw.githubusercontent.com/CesiumGS/cesium/master/Apps/SampleData/models/CesiumAir/Cesium_Air.glb",
                    scale: 1.5,
                    minimumPixelSize: 64,
                    color: Cesium.Color.WHITE,
                    lightColor: new Cesium.Color(1.0, 1.0, 1.0, 1.0),
                    silhouetteColor: Cesium.Color.YELLOW,
                    silhouetteSize: 2.0
                },
                label: {
                    text: planeName,
                    font: '14px sans-serif',
                    fillColor: Cesium.Color.WHITE,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineWidth: 2,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(0, -12)
                },
                name: planeName
            });

            this.entities.set(planeName, entity);
        }
    }

    getEntity(planeName) {
        return this.entities.get(planeName) || null;
    }

    removeEntity(planeName) {
        if (!this.viewer) return;

        const entity = this.entities.get(planeName);
        if (entity) {
            this.viewer.entities.remove(entity);
            this.entities.delete(planeName);
        }
    }

    hasEntity(planeName) {
        return this.entities.has(planeName);
    }
}
