/**
 * Simple Event Emitter for cross-panel communication
 *
 * Used to synchronize events between panels, such as:
 * - Motion tracker anomaly → Seismic spike + Proximity alert
 */

type EventCallback<T = unknown> = (data: T) => void;

interface EventMap {
  anomalyDetected: { angle: number; distance: number };
  anomalyCleared: void;
}

class NostromoEventEmitter {
  private listeners: Map<string, Set<EventCallback<unknown>>> = new Map();

  on<K extends keyof EventMap>(
    event: K,
    callback: EventCallback<EventMap[K]>
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as EventCallback<unknown>);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback as EventCallback<unknown>);
    };
  }

  emit<K extends keyof EventMap>(event: K, data?: EventMap[K]): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  off<K extends keyof EventMap>(
    event: K,
    callback?: EventCallback<EventMap[K]>
  ): void {
    if (callback) {
      this.listeners.get(event)?.delete(callback as EventCallback<unknown>);
    } else {
      this.listeners.delete(event);
    }
  }
}

// Singleton instance for all panels to share
export const nostromoEvents = new NostromoEventEmitter();
