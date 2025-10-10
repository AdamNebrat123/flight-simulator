import React, { useEffect, useState } from 'react';
import './TouchControls.css';

interface TouchControlsProps {
    onKeyStateChange: (key: string, isPressed: boolean) => void;
}

const TouchControls: React.FC<TouchControlsProps> = ({ onKeyStateChange }) => {
    // Track which keys are currently pressed
    const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({});

    // Keyboard event handlers
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.code;
            if (isValidKey(key) && !pressedKeys[key]) {
                setPressedKeys(prev => ({ ...prev, [key]: true }));
                onKeyStateChange(key, true);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            const key = e.code;
            if (isValidKey(key)) {
                setPressedKeys(prev => ({ ...prev, [key]: false }));
                onKeyStateChange(key, false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [onKeyStateChange]);

    // Helper function to check if a key is one we care about
    const isValidKey = (key: string) => {
        return ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key);
    };

    // Button press handlers
    const handleTouchStart = (key: string) => {
        setPressedKeys(prev => ({ ...prev, [key]: true }));
        onKeyStateChange(key, true);
    };

    const handleTouchEnd = (key: string) => {
        setPressedKeys(prev => ({ ...prev, [key]: false }));
        onKeyStateChange(key, false);
    };

    const getButtonClassName = (key: string) => {
        return `touch-button${pressedKeys[key] ? ' pressed' : ''}`;
    };

    return (
        <>
            {/* Movement Controls (WASD) */}
            <div className="controls-container">
                <div></div>
                <button
                    className={`touch-button${pressedKeys['KeyW'] ? ' pressed' : ''}`}
                    onTouchStart={() => handleTouchStart('KeyW')}
                    onTouchEnd={() => handleTouchEnd('KeyW')}
                >
                    W
                </button>
                <div></div>
                <button
                    className={`touch-button${pressedKeys['KeyA'] ? ' pressed' : ''}`}
                    onTouchStart={() => handleTouchStart('KeyA')}
                    onTouchEnd={() => handleTouchEnd('KeyA')}
                >
                    A
                </button>
                <button
                    className={`touch-button${pressedKeys['KeyS'] ? ' pressed' : ''}`}
                    onTouchStart={() => handleTouchStart('KeyS')}
                    onTouchEnd={() => handleTouchEnd('KeyS')}
                >
                    S
                </button>
                <button
                    className={`touch-button${pressedKeys['KeyD'] ? ' pressed' : ''}`}
                    onTouchStart={() => handleTouchStart('KeyD')}
                    onTouchEnd={() => handleTouchEnd('KeyD')}
                >
                    D
                </button>
            </div>

            {/* Arrow Controls */}
            <div className="arrow-controls">
                <div></div>
                <button
                    className={`touch-button${pressedKeys['ArrowUp'] ? ' pressed' : ''}`}
                    onTouchStart={() => handleTouchStart('ArrowUp')}
                    onTouchEnd={() => handleTouchEnd('ArrowUp')}
                >
                    ↑
                </button>
                <div></div>
                <button
                    className={`touch-button${pressedKeys['ArrowLeft'] ? ' pressed' : ''}`}
                    onTouchStart={() => handleTouchStart('ArrowLeft')}
                    onTouchEnd={() => handleTouchEnd('ArrowLeft')}
                >
                    ←
                </button>
                <button
                    className={`touch-button${pressedKeys['ArrowDown'] ? ' pressed' : ''}`}
                    onTouchStart={() => handleTouchStart('ArrowDown')}
                    onTouchEnd={() => handleTouchEnd('ArrowDown')}
                >
                    ↓
                </button>
                <button
                    className={`touch-button${pressedKeys['ArrowRight'] ? ' pressed' : ''}`}
                    onTouchStart={() => handleTouchStart('ArrowRight')}
                    onTouchEnd={() => handleTouchEnd('ArrowRight')}
                >
                    →
                </button>
            </div>
        </>
    );
};

export default TouchControls;