import React from 'react';
import './KillFeed.css';

interface KillNotification {
    id: number;
    killerDroneId: string;
    killedDroneId: string;
    timestamp: number;
}

interface KillFeedProps {
    notifications: KillNotification[];
}

export const KillFeed: React.FC<KillFeedProps> = ({ notifications }) => {
    return (
        <div className="kill-feed">
            {notifications.map((notification) => (
                <div key={notification.id} className="kill-notification">
                    <div className="kill-notification-content">
                        <img 
                            src="/Images/AerialUnitsImages/ImgDrone.png" 
                            alt="Killer" 
                            className="drone-icon"
                        />
                        <span className="drone-id">{notification.killerDroneId.slice(0, 7)}</span>
                        <span className="arrow">→</span>
                        <img 
                            src="/Images/AerialUnitsImages/ImgDrone.png" 
                            alt="Killed" 
                            className="drone-icon"
                        />
                        <span className="drone-id">{notification.killedDroneId.slice(0, 7)}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};