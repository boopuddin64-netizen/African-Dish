import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { RecommendationEvent } from '../types';
import { handleFirestoreError } from '../lib/errorHandling';

export const EVENTS_COLLECTION = 'recommendation_events';

export async function logRecommendationEvent(event: Omit<RecommendationEvent, 'id'>): Promise<string | null> {
  // If the user is unauthenticated or in guest mode, skip remote event persistence
  if (!auth.currentUser) {
    return null;
  }

  const activeUid = auth.currentUser.uid;

  try {
    const docRef = await addDoc(collection(db, EVENTS_COLLECTION), {
      ...event,
      userId: activeUid,
      timestamp: event.timestamp || new Date().toISOString()
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, { 
      operation: 'create', 
      path: EVENTS_COLLECTION,
      authInfo: { uid: activeUid, email: auth.currentUser?.email || undefined }
    });
    return null;
  }
}


