/**
 * Tiny pub/sub used to surface errors and status messages from non-React code (services, error handlers)
 * to the UI. AppContext subscribes and renders them with the <Toast> component.
 */
export type NotificationType = 'error' | 'success' | 'info' | 'warning';

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
}

type Listener = (n: AppNotification) => void;
const listeners = new Set<Listener>();
let counter = 0;

export function subscribeNotifications(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notify(message: string, type: NotificationType = 'info'): void {
  const n: AppNotification = { id: `n_${Date.now()}_${counter++}`, type, message };
  listeners.forEach((l) => l(n));
}
