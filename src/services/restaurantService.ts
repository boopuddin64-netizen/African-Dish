import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Restaurant, Meal } from '../types';
import { RESTAURANTS, MEALS } from '../data/mockData';
import { CITY_COORDINATES } from './locationService';

export const RESTAURANTS_COLLECTION = 'restaurants';
export const MEALS_COLLECTION = 'meals';

/**
 * Seeds initial restaurant and meal data to Firestore if not already seeded.
 * All default mock items are marked with isDemo: true.
 */
export async function seedFirestoreInitialData(): Promise<void> {
  try {
    const restSnap = await getDocs(collection(db, RESTAURANTS_COLLECTION));
    if (restSnap.empty) {
      console.log('Seeding initial Demo Restaurants to Firestore...');
      for (const r of RESTAURANTS) {
        const coords = CITY_COORDINATES[r.city] || CITY_COORDINATES['Port Harcourt'];
        const demoRestaurant: Restaurant = {
          ...r,
          name: r.name.includes('[Demo]') ? r.name : `${r.name} [Demo]`,
          isOpen: true,
          status: 'open',
          acceptingOrders: true,
          isDemo: true,
          coordinates: coords
        };
        await setDoc(doc(db, RESTAURANTS_COLLECTION, r.id), demoRestaurant);
      }
    }

    // Upsert demo meals into Firestore so new items are guaranteed to populate
    for (const m of MEALS) {
      const demoMeal: Meal = {
        ...m,
        isAvailable: true,
        isDemo: true
      };
      await setDoc(doc(db, MEALS_COLLECTION, m.id), demoMeal, { merge: true });
    }
  } catch (err) {
    console.error('Error seeding Firestore data:', err);
  }
}

/**
 * Subscribes to real-time restaurant updates from Firestore.
 */
export function subscribeToRestaurants(callback: (restaurants: Restaurant[]) => void) {
  const q = collection(db, RESTAURANTS_COLLECTION);
  return onSnapshot(q, (snapshot) => {
    const list: Restaurant[] = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as Restaurant);
    });
    callback(list);
  }, (error) => {
    console.error('Error in restaurant snapshot:', error);
  });
}

/**
 * Updates a restaurant's availability or settings in Firestore.
 */
export async function updateRestaurant(restaurantId: string, updates: Partial<Restaurant>): Promise<void> {
  const ref = doc(db, RESTAURANTS_COLLECTION, restaurantId);
  await setDoc(ref, updates, { merge: true });
}
