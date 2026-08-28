import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Meal } from '../types';
import { RESTAURANTS_COLLECTION, MEALS_COLLECTION } from './restaurantService';
import { handleFirestoreError } from '../lib/errorHandling';

export function subscribeToMeals(callback: (meals: Meal[]) => void) {
  const q = collection(db, MEALS_COLLECTION);
  return onSnapshot(q, (snapshot) => {
    const list: Meal[] = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as Meal);
    });
    callback(list);
  }, (err) => {
    handleFirestoreError(err, { operation: 'subscribe', path: MEALS_COLLECTION });
  });
}

export async function updateMeal(mealId: string, updates: Partial<Meal>): Promise<void> {
  try {
    const ref = doc(db, MEALS_COLLECTION, mealId);
    await setDoc(ref, updates, { merge: true });
  } catch (err) {
    handleFirestoreError(err, { operation: 'update', path: `${MEALS_COLLECTION}/${mealId}` });
  }
}

export async function addMeal(meal: Meal): Promise<void> {
  try {
    const ref = doc(db, MEALS_COLLECTION, meal.id);
    await setDoc(ref, meal);
  } catch (err) {
    handleFirestoreError(err, { operation: 'create', path: `${MEALS_COLLECTION}/${meal.id}` });
  }
}

