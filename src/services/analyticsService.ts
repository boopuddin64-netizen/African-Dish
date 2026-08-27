import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { RecommendationEvent } from '../types';

export const EVENTS_COLLECTION = 'recommendation_events';

export async function logRecommendationEvent(event: Omit<RecommendationEvent, 'id'>): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, EVENTS_COLLECTION), {
      ...event,
      timestamp: event.timestamp || new Date().toISOString()
    });
    return docRef.id;
  } catch (err) {
    console.error('Error logging recommendation event to Firestore:', err);
    return null;
  }
}
