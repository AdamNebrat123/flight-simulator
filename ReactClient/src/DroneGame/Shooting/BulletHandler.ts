import type { BulletData, BulletsMsg } from "../../Messages/AllTypes";
import { BulletEntityManager } from "./BulletEntityManager";
import * as Cesium from "cesium";

export class BulletHandler {
  private static instance: BulletHandler | null = null;
  private bulletEntityManager: BulletEntityManager;

  private constructor(viewer: Cesium.Viewer) {
    this.bulletEntityManager = BulletEntityManager.getInstance(viewer);
  }

  public static getInstance(viewer?: Cesium.Viewer): BulletHandler {
    if (!this.instance) {
      if (!viewer) {
        throw new Error("Viewer must be provided for the first getInstance call");
      }
      this.instance = new BulletHandler(viewer);
    }
    return this.instance;
  }

  // Handles BulletsMsg data (e.g., from WebSocket)
  public handleBulletsMsg(data: any): void {
    try {
      const bulletsMsg = data as BulletsMsg;
      if (!bulletsMsg.bullets || !Array.isArray(bulletsMsg.bullets)) return;

      // Handle each bullet in the message
      for (const bullet of bulletsMsg.bullets) {
        if (bullet.isLast) {
          this.bulletEntityManager.removeBullet(bullet.bulletId);
        } else {
          this.bulletEntityManager.updateBullet(bullet);
        }
      }
    } catch (err) {
      console.error("Data could not be parsed to BulletsMsg:", err);
    }
  }

  // Optionally, clear all bullets
  public clearAllBullets(): void {
    this.bulletEntityManager.clearAllBullets();
  }
}
