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
import { handleFirestoreError } from '../lib/errorHandling';

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
    handleFirestoreError(err, { operation: 'get', path: `users/${uid}` });
    return null;
  }
}

export async function createUserProfile(uid: string, data: Partial<UserProfile>): Promise<UserProfile> {
  try {
    // Sanitize privileged properties during self-registration
    const sanitizedData = { ...data };
    // Self-registration is ALWAYS a customer; elevated roles are granted by admins via roleRequests.
    sanitizedData.role = 'customer';
    delete (sanitizedData as { isAdmin?: boolean }).isAdmin;

    const profile: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      ...sanitizedData,
      id: uid,
    };
    await setDoc(doc(db, 'users', uid), profile, { merge: true });
    return profile;
  } catch (err) {
    handleFirestoreError(err, { operation: 'create', path: `users/${uid}` });
    throw err;
  }
}

/**
 * Removes privileged fields that Firestore rules reject when written by the user themself:
 * `role`, `isAdmin`, `verified` and the staff `assignedRestaurantId`. Role changes go through roleRequests
 * (see roleService) and are granted by an admin; assignment is set at approval time.
 */
export function sanitizeProfileUpdates(updates: Partial<UserProfile>): Record<string, unknown> {
  const { role: _role, ...rest } = updates as Partial<UserProfile> & { isAdmin?: boolean; verified?: boolean };
  const safe: Record<string, unknown> = { ...rest };
  delete safe.isAdmin;
  delete safe.verified;
  if (rest.kitchenStaff) {
    const { assignedRestaurantId: _assigned, ...staffRest } = rest.kitchenStaff;
    safe.kitchenStaff = staffRest;
  }
  return safe;
}

export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  if (uid === 'guest_demo_user' || uid.startsWith('guest_') || !auth.currentUser || auth.currentUser.uid !== uid) {
    // Guests / demo sessions are local-only: never attempt to persist them to Firestore
    return;
  }

  try {
    await setDoc(doc(db, 'users', uid), sanitizeProfileUpdates(updates), { merge: true });
  } catch (err) {
    handleFirestoreError(err, { operation: 'update', path: `users/${uid}` });
  }
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

