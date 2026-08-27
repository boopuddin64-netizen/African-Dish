import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged as firebaseOnAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'guest_demo_user',
  name: 'Demo Guest User',
  email: 'guest@example.com',
  phone: '+234 803 123 4567',
  role: 'customer',
  theme: 'light',
  currentLocationId: 'loc_home_ph',
  savedLocations: [
    {
      id: 'loc_home_ph',
      label: 'Home (GRA Phase 2)',
      address: '14 Tombia Street, GRA Phase 2',
      city: 'Port Harcourt',
      postcodeOrArea: '500272',
      isDefault: true,
      currency: 'NGN',
      coordinates: { lat: 4.8156, lng: 7.0498 }
    },
    {
      id: 'loc_office_ph',
      label: 'Office (Trans Amadi)',
      address: '88 Trans Amadi Industrial Layout',
      city: 'Port Harcourt',
      postcodeOrArea: '500211',
      isDefault: false,
      currency: 'NGN',
      coordinates: { lat: 4.8250, lng: 7.0380 }
    }
  ],
  preferences: {
    explicitCuisines: ['Nigerian', 'Ghanaian'],
    preferredSpiceLevel: 'medium',
    dietaryFlags: [],
    dislikedIngredients: ['Cilantro'],
    favoriteMeals: [],
    priceSensitivity: 'standard'
  },
  safety: {
    allergies: [],
    strictSafetyEnforcement: true,
    notes: 'Mild intolerance to raw peanuts'
  },
  behavior: {
    orderedMealIds: [],
    rejectedMealIds: [],
    ratedMeals: [],
    rememberedCustomizations: {}
  }
};

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as UserProfile;
    }
    return null;
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return null;
  }
}

export async function createUserProfile(uid: string, data: Partial<UserProfile>): Promise<UserProfile> {
  const profile: UserProfile = {
    ...DEFAULT_USER_PROFILE,
    ...data,
    id: uid,
  };
  await setDoc(doc(db, 'users', uid), profile, { merge: true });
  return profile;
}

export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  await setDoc(doc(db, 'users', uid), updates, { merge: true });
}

export function subscribeToAuthChanges(callback: (user: UserProfile | null) => void) {
  return firebaseOnAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
    if (fbUser) {
      let profile = await getUserProfile(fbUser.uid);
      if (!profile) {
        profile = await createUserProfile(fbUser.uid, {
          email: fbUser.email || '',
          name: fbUser.displayName || 'Marketplace User',
        });
      }
      callback(profile);
    } else {
      callback(null);
    }
  });
}

export async function loginWithEmail(email: string, pass: string): Promise<UserProfile> {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  let profile = await getUserProfile(cred.user.uid);
  if (!profile) {
    profile = await createUserProfile(cred.user.uid, { email });
  }
  return profile;
}

export async function signUpWithEmail(email: string, pass: string, name: string): Promise<UserProfile> {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  return await createUserProfile(cred.user.uid, { email, name });
}

export async function loginWithGoogle(): Promise<UserProfile> {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  let profile = await getUserProfile(cred.user.uid);
  if (!profile) {
    profile = await createUserProfile(cred.user.uid, {
      email: cred.user.email || '',
      name: cred.user.displayName || 'Google User',
    });
  }
  return profile;
}

export async function logoutUser(): Promise<void> {
  await firebaseSignOut(auth);
}
