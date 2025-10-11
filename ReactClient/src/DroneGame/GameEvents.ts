// src/DroneGame/GameEvents.ts
type Listener<T> = (data: T) => void;

class GameEvent<T> {
  private listeners = new Set<Listener<T>>();

  subscribe(listener: Listener<T>): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  dispatch(data: T) {
    for (const l of this.listeners) l(data);
  }
}

// Example event types
export type KillEventData = {
  killerDroneId: string;
  killedDroneId: string;
  timestamp: number;
};

// Export any events you want globally
export const onKillEvent = new GameEvent<KillEventData>();
