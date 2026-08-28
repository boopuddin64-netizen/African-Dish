import { auth } from './firebase';

export interface FirestoreErrorContext {
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'subscribe';
  path: string;
  authInfo?: {
    uid?: string;
    email?: string;
  };
}

export function handleFirestoreError(error: unknown, context: FirestoreErrorContext): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const isUnauthenticated = !auth.currentUser || context.authInfo?.uid === 'unauthenticated';

  // In unauthenticated guest mode, permission-denied errors are expected and handled gracefully
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
}
