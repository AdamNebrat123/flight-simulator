import { useState, useRef, useEffect } from "react";
import * as Cesium from "cesium";
import DroneGameViewer from "./DroneGameViewer";
import { ShootingMechanics } from "./Shooting/ShootingMechanics";

export default function DroneGame() {
    const [viewer, setViewer] = useState<Cesium.Viewer | null>(null);
    const shootingRef = useRef<ShootingMechanics | null>(null);

    useEffect(() => {
        if (viewer) {
            // Initialize shooting mechanics only once per viewer
            if (!shootingRef.current) {
                shootingRef.current = new ShootingMechanics(viewer);
            }

        } else {
            // Cleanup if viewer is destroyed
            if (shootingRef.current) {
                shootingRef.current.destroy();
                shootingRef.current = null;
            }
        }

        // Cleanup on unmount
        return () => {
            if (shootingRef.current) {
                shootingRef.current.destroy();
                shootingRef.current = null;
            }
        };
    }, [viewer]);

    return (
        <div style={{ width: "100%", height: "100vh", position: "relative" }}>
            <DroneGameViewer onViewerReady={setViewer} />
            {/* Add your game UI or controls here */}
        </div>
    );
}