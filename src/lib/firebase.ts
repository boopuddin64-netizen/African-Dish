import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import config from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(config) : getApp();

// Use explicit databaseId if provided in config, with auto-detect long polling for network resilience
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
}, config.firestoreDatabaseId || undefined);

export const auth = getAuth(app);
export default app;
