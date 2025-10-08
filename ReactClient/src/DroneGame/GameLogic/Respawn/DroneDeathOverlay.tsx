import React, { useEffect, useState } from "react";
import "./DroneDeathOverlay.css";


type DroneDeathOverlayProps = {
	killerName?: string;
	respawnSeconds: number;
	setIsAlive: (alive: boolean) => void;
	onRespawn?: () => void;
};

export default function DroneDeathOverlay({ killerName, respawnSeconds, setIsAlive, onRespawn }: DroneDeathOverlayProps) {
	const [secondsLeft, setSecondsLeft] = useState(respawnSeconds);

	useEffect(() => {
		setSecondsLeft(respawnSeconds);
		if (respawnSeconds <= 0) return;
		const interval = setInterval(() => {
			setSecondsLeft(prev => {
				if (prev <= 1) {
					clearInterval(interval);
					setTimeout(() => {
						setIsAlive(true);
						if (onRespawn) onRespawn();
					}, 300);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
		return () => clearInterval(interval);
	}, [respawnSeconds, setIsAlive, onRespawn]);

	return (
		<div className="drone-death-overlay">
			<div className="drone-death-title">You Died!</div>
			{killerName && (
				<div className="drone-death-killer">
					Killed by: <span>{killerName}</span>
				</div>
			)}
			<div className="drone-death-respawn">
				Respawning in <span>{secondsLeft}</span> seconds...
			</div>
		</div>
	);
}
