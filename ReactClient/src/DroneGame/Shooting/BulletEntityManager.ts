import * as Cesium from "cesium";
import type { BulletData } from "../../Messages/AllTypes";

export class BulletEntityManager {
    private static instance: BulletEntityManager | null = null;
    private viewer: Cesium.Viewer;
    private bulletIdToEntity: Map<string, Cesium.Entity>;

    private constructor(viewer: Cesium.Viewer) {
        this.viewer = viewer;
        this.bulletIdToEntity = new Map<string, Cesium.Entity>();
        console.log("[BulletEntityManager] Initialized");
    }

    public static getInstance(viewer?: Cesium.Viewer): BulletEntityManager {
        if (!BulletEntityManager.instance) {
            if (!viewer) {
                throw new Error("Viewer must be provided for the first getInstance call");
            }
            BulletEntityManager.instance = new BulletEntityManager(viewer);
            console.log("[BulletEntityManager] Instance created");
        }
        return BulletEntityManager.instance;
    }

    addBullet(bullet: BulletData): Cesium.Entity | null {
        if (this.bulletIdToEntity.has(bullet.bulletId)) {
            console.log(`[BulletEntityManager] Bullet already exists: ${bullet.bulletId}`);
            return this.bulletIdToEntity.get(bullet.bulletId)!;
        }
        try {
            const pos = Cesium.Cartesian3.fromDegrees(
                bullet.position.longitude,
                bullet.position.latitude,
                bullet.position.altitude
            );
            const entity = this.viewer.entities.add({
                    id: bullet.bulletId,
                    position: new Cesium.ConstantPositionProperty(pos),
                    model: {
                        uri: "/models/Sphere.glb",
                        scale: 10,
                        minimumPixelSize: 8,
                        color: Cesium.Color.RED.withAlpha(0.95),
                    },
                  });
            
            this.bulletIdToEntity.set(bullet.bulletId, entity);
            console.log(`[BulletEntityManager] Bullet added: ${bullet.bulletId}`, bullet);
            return entity;
        } catch (err) {
            console.error("Failed to add bullet:", err);
            return null;
        }
    }

    updateBullet(bullet: BulletData): boolean {
        let entity = this.bulletIdToEntity.get(bullet.bulletId);
        if (!entity) {
            console.log(`[BulletEntityManager] Bullet not found, adding: ${bullet.bulletId}`);
            entity = this.addBullet(bullet)!;
            if (!entity) return false;
        }
        try {
            const pos = Cesium.Cartesian3.fromDegrees(
                bullet.position.longitude,
                bullet.position.latitude,
                bullet.position.altitude
            );
            entity.position = new Cesium.ConstantPositionProperty(pos);
            console.log(`[BulletEntityManager] Bullet updated: ${bullet.bulletId}`, bullet);
            return true;
        } catch (err) {
            console.error("Failed to update bullet:", err);
            return false;
        }
    }

    removeBullet(bulletId: string): boolean {
        const entity = this.bulletIdToEntity.get(bulletId);
        if (!entity) {
            console.log(`[BulletEntityManager] Bullet not found for removal: ${bulletId}`);
            return false;
        }
        this.viewer.entities.remove(entity);
        this.bulletIdToEntity.delete(bulletId);
        console.log(`[BulletEntityManager] Bullet removed: ${bulletId}`);
        return true;
    }

    getBulletEntity(bulletId: string): Cesium.Entity | null {
        const entity = this.bulletIdToEntity.get(bulletId) ?? null;
        console.log(`[BulletEntityManager] Get bullet entity: ${bulletId}`, entity);
        return entity;
    }

    getAllBulletIds(): string[] {
        const ids = Array.from(this.bulletIdToEntity.keys());
        console.log("[BulletEntityManager] All bullet IDs:", ids);
        return ids;
    }

    clearAllBullets() {
        for (const entity of this.bulletIdToEntity.values()) {
            this.viewer.entities.remove(entity);
        }
        this.bulletIdToEntity.clear();
        console.log("[BulletEntityManager] All bullets cleared");
    }
}
