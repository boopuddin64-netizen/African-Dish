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
import { handleFirestoreError } from '../lib/errorHandling';

export const RESTAURANTS_COLLECTION = 'restaurants';
export const MEALS_COLLECTION = 'meals';

/**
 * Seeds initial restaurant and meal data to Firestore if not already seeded.
 * Prevents overwriting user modifications once seeded.
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

    const mealsSnap = await getDocs(collection(db, MEALS_COLLECTION));
    if (mealsSnap.empty) {
      console.log('Seeding initial Demo Meals to Firestore...');
      for (const m of MEALS) {
        const demoMeal: Meal = {
          ...m,
          isAvailable: true,
          isDemo: true
        };
        await setDoc(doc(db, MEALS_COLLECTION, m.id), demoMeal);
      }
    }
  } catch (err) {
    handleFirestoreError(err, { operation: 'create', path: 'seedInitialData' });
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
    handleFirestoreError(error, { operation: 'subscribe', path: RESTAURANTS_COLLECTION });
  });
}

/**
 * Updates a restaurant's availability or settings in Firestore.
 */
export async function updateRestaurant(restaurantId: string, updates: Partial<Restaurant>): Promise<void> {
  try {
    const ref = doc(db, RESTAURANTS_COLLECTION, restaurantId);
    await setDoc(ref, updates, { merge: true });
  } catch (err) {
    handleFirestoreError(err, { operation: 'update', path: `${RESTAURANTS_COLLECTION}/${restaurantId}` });
  }
}

