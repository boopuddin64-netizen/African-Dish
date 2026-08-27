import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Meal } from '../types';
import { MEALS_COLLECTION } from './restaurantService';

export function subscribeToMeals(callback: (meals: Meal[]) => void) {
  const q = collection(db, MEALS_COLLECTION);
  return onSnapshot(q, (snapshot) => {
    const list: Meal[] = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as Meal);
    });
    callback(list);
  }, (err) => {
    console.error('Error in meal snapshot:', err);
  });
}

export async function updateMeal(mealId: string, updates: Partial<Meal>): Promise<void> {
  const ref = doc(db, MEALS_COLLECTION, mealId);
  await setDoc(ref, updates, { merge: true });
}

export async function addMeal(meal: Meal): Promise<void> {
  const ref = doc(db, MEALS_COLLECTION, meal.id);
  await setDoc(ref, meal);
}
