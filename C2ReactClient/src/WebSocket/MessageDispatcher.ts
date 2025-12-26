export type MessageHandler<T = any> = (data: T) => void;

export class MessageDispatcher {
  private subscriptions: Record<string, MessageHandler[]> = {};

  on<T>(messageType: string, handler: MessageHandler<T>): () => void {
    if (!this.subscriptions[messageType]) {
      this.subscriptions[messageType] = [];
    }
    this.subscriptions[messageType].push(handler);

    // Return unsubscribe function
    return () => {
      this.subscriptions[messageType] = this.subscriptions[messageType].filter(h => h !== handler);
    };
  }

  off<T>(messageType: string, handler: MessageHandler<T>): void {
    this.subscriptions[messageType] = (this.subscriptions[messageType] || []).filter(h => h !== handler);
  }

  dispatch<T>(messageType: string, data: T): void {
    (this.subscriptions[messageType] || []).forEach(handler => handler(data));
  }
}