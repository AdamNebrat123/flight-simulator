import React, { useEffect, useState } from 'react';
import './KillFeed.css';
import type { DroneKilled } from '../../Messages/AllTypes';
import { onKillEvent } from '../GameEvents';

interface KillNotification {
    id: number;
    killerDroneId: string;
    killedDroneId: string;
    timestamp: number;
}


export default function KillFeed() {

    const [notifications, setNotifications] = useState<KillNotification[]>([]);

    const addNotification = (data: any) => {
        console.log("Kill event received in KillFeed:", data);
        const droneKilled = data as DroneKilled;
        // Add new kill notification
        const newNotification = {
            id: Date.now(),
            killerDroneId: droneKilled.killerDroneId,
            killedDroneId: droneKilled.killedDroneId,
            timestamp: Date.now()
        };
        
        setNotifications(prev => [...prev, newNotification]);
        
        // Remove notification after 5 seconds
        setTimeout(() => {
            setNotifications(prev => 
                prev.filter(notification => notification.id !== newNotification.id)
            );
        }, 5000);
    }

    useEffect(() => { 
        const unsubscribe = onKillEvent.subscribe(addNotification);
        return unsubscribe;
    }, []);
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