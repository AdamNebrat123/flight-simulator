import * as Cesium from "cesium";
import type { Jammer } from "../Jammer/Jammer";
import type { Frequency } from "../Jammer/JammerRelatedEnums";
import type { GeoPoint } from "../../Messages/AllTypes";
import { JammerColorOptionsManager } from "./JammerColorOptions";

export class JammerEntity {
    private viewer: Cesium.Viewer | null;
    private jammerEntity: Cesium.Entity | null;
    private jammer: Jammer;
    private rangeEntity: Cesium.Entity | null = null;
    private omniEntity: Cesium.Entity | null = null;
    private directionalEntity: Cesium.Entity | null = null;
    private beamWidthDeg: number = 40;
    private directionDeg: number = 0;
    private leftWallEntity: Cesium.Entity | null = null;
    private rightWallEntity: Cesium.Entity | null = null;


    constructor(viewer: Cesium.Viewer, jammer: Jammer) {
        this.viewer = viewer;
        this.jammerEntity = null;
        this.jammer = jammer;
        this.createEntities();
    }

    setJammer(jammer: Jammer) {
        this.jammer = jammer;
    }

    getJammer(): Jammer {
        return this.jammer;
    }

    setEntityNull() {
        this.jammerEntity = null;
    }

    // update position
    updatePosition(position: GeoPoint) {
        this.jammer.position = position;
        const newPosition = Cesium.Cartesian3.fromDegrees(this.jammer.position.longitude, this.jammer.position.latitude, this.jammer.position.altitude);
        if (this.jammerEntity) {
        this.jammerEntity.position = new Cesium.ConstantPositionProperty(newPosition);
        }

        if (this.rangeEntity) {
            this.rangeEntity.position = new Cesium.ConstantPositionProperty(newPosition);
        }

        if (this.omniEntity) {
            this.omniEntity.position = new Cesium.ConstantPositionProperty(newPosition);
        }
        if (this.directionalEntity) {
            this.directionalEntity.position = new Cesium.ConstantPositionProperty(newPosition);
        }

    }

    // update radius
    updateRadius(radius: number) {
        this.jammer.radius = radius;
        if (this.rangeEntity && this.rangeEntity.cylinder) {
        this.rangeEntity.cylinder.topRadius = new Cesium.ConstantProperty(radius);
        this.rangeEntity.cylinder.bottomRadius = new Cesium.ConstantProperty(radius);
        }
        if (this.omniEntity && this.omniEntity.ellipsoid) {
            this.omniEntity.ellipsoid.radii = new Cesium.ConstantProperty(new Cesium.Cartesian3(radius, radius, radius));
        }
        if (this.directionalEntity && this.directionalEntity.ellipsoid) {
            this.directionalEntity.ellipsoid.radii = new Cesium.ConstantProperty(new Cesium.Cartesian3(radius, radius, radius));
        }
    }

    // update frequencies
    updateFrequencies(frequencies: Frequency[]) {
        this.jammer.supportedFrequencies = frequencies;
    }

    createEntities() {
        if (this.viewer === null || this.jammer === null)
        return;

        const position = Cesium.Cartesian3.fromDegrees(
        this.jammer.position.longitude,
        this.jammer.position.latitude,
        this.jammer.position.altitude
        );

        const options =  JammerColorOptionsManager.getJammerColorOptionsByString(this.jammer.status)
        this.jammerEntity = this.viewer.entities.add({
                position: new Cesium.ConstantPositionProperty(position),
                model: {
                    uri: `/models/Jammer.glb`,
                    scale: 25.0,
                    minimumPixelSize: 64,
                    color:options?.color.withAlpha(1),
                    colorBlendMode: Cesium.ColorBlendMode.MIX,
                    colorBlendAmount: 0.1,
                    silhouetteColor: options?.outlineColor,
                    silhouetteSize: 2,
                }
        });

        this.rangeEntity = this.viewer.entities.add({
                position: new Cesium.ConstantPositionProperty(position),
                cylinder: {
                    length: 20,
                    topRadius: this.jammer.radius,
                    bottomRadius: this.jammer.radius,

                    material: Cesium.Color.TRANSPARENT,
                    outline: true,
                    outlineColor: Cesium.Color.YELLOW,
                    outlineWidth: 2,
                }
            });

        this.omniEntity = this.viewer.entities.add({
                position: new Cesium.ConstantPositionProperty(position),
                ellipsoid: {
                    radii: new Cesium.Cartesian3(
                    this.jammer.radius,
                    this.jammer.radius,
                    this.jammer.radius
                    ),
                    material: Cesium.Color.RED.withAlpha(0.4),
                    outline: false
                },
                show: false // starting as hidden.
            });

        this.directionalEntity = this.viewer.entities.add({
                position: new Cesium.ConstantPositionProperty(position),
                ellipsoid: {
                    radii: new Cesium.Cartesian3(
                    this.jammer.radius,
                    this.jammer.radius,
                    this.jammer.radius
                    ),
                    material: Cesium.Color.RED.withAlpha(0.6),
                },
                show: false // starting as hidden.
            });


        this.leftWallEntity = this.viewer.entities.add({
                show: false,
                polygon: {
                    hierarchy: new Cesium.CallbackProperty(() => this.getHalfCircleHierarchy(true), false),
                    material: Cesium.Color.RED.withAlpha(0.4),
                    perPositionHeight: true,
                    outline: false
                }
        });

        this.rightWallEntity = this.viewer.entities.add({
                show: false,
                polygon: {
                    hierarchy: new Cesium.CallbackProperty(() => this.getHalfCircleHierarchy(false), false),
                    material: Cesium.Color.RED.withAlpha(0.4),
                    perPositionHeight: true,
                    outline: false
                }
        });

    }


    removeEntities(){
        if(this.jammerEntity){
            this.viewer?.entities.remove(this.jammerEntity)
        }

        if (this.rangeEntity){
        this.viewer?.entities.remove(this.rangeEntity);
        }

        if (this.omniEntity) {
            this.viewer?.entities.remove(this.omniEntity);
        }

        if (this.directionalEntity) {
            this.viewer?.entities.remove(this.directionalEntity);
        }

        if(this.leftWallEntity){
            this.viewer?.entities.remove(this.leftWallEntity);
        }

        if(this.rightWallEntity){
            this.viewer?.entities.remove(this.rightWallEntity);
        }

        this.jammerEntity = null;
        this.rangeEntity = null;
        this.omniEntity = null;
        this.directionalEntity = null;
        this.leftWallEntity = null
        this.rightWallEntity = null

    }

    showOmni() {
        if (this.omniEntity) {
            this.omniEntity.show = true;
        }
    }

    hideOmni() {
        if (this.omniEntity) {
            this.omniEntity.show = false;
        }
    }

    showDirectional(directionDeg: number) {
    if (!this.directionalEntity?.ellipsoid) return;
    
    this.directionDeg = directionDeg;
    if (this.leftWallEntity) this.leftWallEntity.show = true;
    if (this.rightWallEntity) this.rightWallEntity.show = true;
    const half = this.beamWidthDeg / 2;

    // התיקון הקריטי:
    // 1. הופכים את הכיוון (מכיוון השעון לנגד כיוון השעון) ע"י מינוס.
    // 2. מוסיפים 90 מעלות כדי להזיז את ה-0 מהמזרח לצפון.
    const cesiumCenterAngle = 90 - directionDeg;

    const minClock = Cesium.Math.toRadians(cesiumCenterAngle - half);
    const maxClock = Cesium.Math.toRadians(cesiumCenterAngle + half);

    this.directionalEntity.ellipsoid.minimumClock = new Cesium.ConstantProperty(minClock);
    this.directionalEntity.ellipsoid.maximumClock = new Cesium.ConstantProperty(maxClock);
    this.directionalEntity.show = true;
}

    hideDirectional() {
        if (this.directionalEntity) {
            this.directionalEntity.show = false;
        }
        if (this.leftWallEntity) this.leftWallEntity.show = false;
        if (this.rightWallEntity) this.rightWallEntity.show = false;
    }

    private getHalfCircleHierarchy(isLeft: boolean) {
        const radius = this.jammer.radius;
        const centerCartesian = Cesium.Cartesian3.fromDegrees(
            this.jammer.position.longitude,
            this.jammer.position.latitude,
            this.jammer.position.altitude
        );

        const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(centerCartesian);
        
        const angle = isLeft ? 
            this.directionDeg - (this.beamWidthDeg / 2) : 
            this.directionDeg + (this.beamWidthDeg / 2);
        
        const headingRad = Cesium.Math.toRadians(angle);

        const positions: Cesium.Cartesian3[] = [];
        
        positions.push(centerCartesian);

        const samples = 50; 
        for (let i = 0; i <= samples; i++) {
            const phi = (Math.PI / 2) - (i / samples) * Math.PI;
            
            const localZ = radius * Math.sin(phi);
            const horizontalDist = radius * Math.cos(phi);

            const localX = horizontalDist * Math.sin(headingRad);
            const localY = horizontalDist * Math.cos(headingRad);

            const localPoint = new Cesium.Cartesian3(localX, localY, localZ);
            
            const globalPoint = Cesium.Matrix4.multiplyByPoint(modelMatrix, localPoint, new Cesium.Cartesian3());
            positions.push(globalPoint);
        }

        return new Cesium.PolygonHierarchy(positions);
    }
}