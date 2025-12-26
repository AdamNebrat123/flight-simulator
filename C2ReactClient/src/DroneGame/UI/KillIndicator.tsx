import { useEffect, useState } from 'react';
import { onKillEvent } from '../GameEvents';
import { DroneKilled } from '../../Messages/AllTypes';

interface KillIndicatorProps {
    myDroneId: string;
}

export default function KillIndicator({ myDroneId }: KillIndicatorProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [opacity, setOpacity] = useState(0.8);
    const showDuration = 750; // total duration to show the indicator

    const showKillIndicator = (data: any) => {
        console.log("Kill event received in Kill Indicator:", data);
        const droneKilled = data as DroneKilled;
        if(droneKilled.killerDroneId !== myDroneId) 
            return; // Only show if we killed someone

        setIsVisible(true);
        setOpacity(0.8);

        const fadeTimeout = setTimeout(() => {
            setOpacity(0);
        }, showDuration - 300); // Start fade 300ms before hiding

        const hideTimeout = setTimeout(() => {
            setIsVisible(false);
        }, showDuration);

        return () => {
            clearTimeout(fadeTimeout);
            clearTimeout(hideTimeout);
        };
    };

    useEffect(() => {
        const unsubscribe = onKillEvent.subscribe(showKillIndicator);
        return unsubscribe;
    }, []);

    if (!isVisible) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1000,
                opacity,
                transition: 'opacity 0.3s ease-out',
            }}
        >
            <img
                src="/Images/DroneGameImages/killedSkull.png"
                alt="Kill Indicator"
                style={{
                    width: '64px',
                    height: '64px',
                }}
            />
        </div>
    );
};