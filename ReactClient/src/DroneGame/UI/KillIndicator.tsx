import React, { useEffect, useState } from 'react';

interface KillIndicatorProps {
    showDuration: number; // Duration in milliseconds
    isVisible: boolean;
    onHide: () => void;
}

const KillIndicator: React.FC<KillIndicatorProps> = ({ showDuration, isVisible, onHide }) => {
    const [opacity, setOpacity] = useState(0.8);

    useEffect(() => {
        if (isVisible) {
            console.log("KillIndicator became visible");
            setOpacity(0.8);
            const fadeTimeout = setTimeout(() => {
                setOpacity(0);
            }, showDuration - 300); // Start fade 300ms before hiding

            const hideTimeout = setTimeout(() => {
                onHide();
            }, showDuration);

            return () => {
                clearTimeout(fadeTimeout);
                clearTimeout(hideTimeout);
            };
        }
    }, [isVisible, showDuration, onHide]);

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

export default KillIndicator;