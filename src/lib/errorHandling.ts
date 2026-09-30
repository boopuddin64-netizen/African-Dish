import { auth } from './firebase';
import { notify } from './notifications';

export interface FirestoreErrorContext {
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'subscribe';
  path: string;
  authInfo?: {
    uid?: string;
    email?: string;
  };
}

/** Turn a raw Firebase/Firestore error into something a user can act on. */
export function friendlyErrorMessage(error: unknown, context: FirestoreErrorContext): string {
  const code = (error as { code?: string } | null)?.code ?? '';
  const raw = error instanceof Error ? error.message : String(error);
  const what = { get: 'load data', list: 'load data', create: 'save this', update: 'save your changes', delete: 'delete this', subscribe: 'sync live data' }[context.operation];
  if (code.includes('permission-denied') || /permission|insufficient/i.test(raw)) {
    return `You don't have permission to ${what}. If this looks wrong, sign in again or contact support.`;
  }
  if (code.includes('unavailable') || /offline/i.test(raw)) {
    return `Network problem: couldn't ${what}. Check your connection and try again.`;
  }
  if (code.includes('not-found')) return `That item no longer exists, so we couldn't ${what}.`;
  // Errors we throw ourselves (e.g. invalid order transition) already carry a user-facing message.
  if (error instanceof Error && error.name !== 'FirebaseError') return raw;
  return `Something went wrong while trying to ${what}.`;
}

/**
 * Central Firestore error handler: logs structured details and surfaces a toast to the user.
 * In unauthenticated guest mode permission errors are expected, so they are only logged.
 * Callers that also re-throw (e.g. order updates) can pass { silent: true } to avoid a duplicate toast.
 */
export function handleFirestoreError(
  error: unknown,
  context: FirestoreErrorContext,
  options: { silent?: boolean } = {}
): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const isUnauthenticated = !auth.currentUser || context.authInfo?.uid === 'unauthenticated';

  if (isUnauthenticated) {
    console.warn(`Firestore [${context.operation} ${context.path}] skipped in unauthenticated guest mode: ${errorMessage}`);
    return;
  }

  const jsonError = JSON.stringify({
    error: errorMessage,
    operation: context.operation,
    path: context.path,
    authInfo: context.authInfo || {
      uid: auth.currentUser?.uid,
      email: auth.currentUser?.email || undefined
    }
  });
  console.error(`Firestore Error [${context.operation} ${context.path}]:`, jsonError);

  if (!options.silent) {
    notify(friendlyErrorMessage(error, context), 'error');
  }
}
