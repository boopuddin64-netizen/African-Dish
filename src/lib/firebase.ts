import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import config from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(config) : getApp();

// Initialize Firestore using the standard SDK helper and designated database ID
export const db = config.firestoreDatabaseId 
  ? getFirestore(app, config.firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);

/** Cloud Functions client (trusted-server path: order pricing, payments, role approval). */
export const functions = getFunctions(app);

/**
 * Local development: set VITE_USE_FIREBASE_EMULATORS=true to talk to the Auth + Functions emulators
 * (`firebase emulators:start --only auth,functions,firestore`).
 */
export const USE_EMULATORS = import.meta.env?.VITE_USE_FIREBASE_EMULATORS === 'true';
if (USE_EMULATORS) {
  connectFunctionsEmulator(functions, '127.0.0.1', 5001);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
}

export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore connection check: operating in offline mode.");
    }
    return false;
  }
}

export default app;
