import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  arrayUnion,
  deleteDoc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { handleFirestoreError } from '../lib/errorHandling';
import { RESTAURANTS_COLLECTION } from './restaurantService';

/**
 * Role upgrades without self-promotion.
 *
 * Firestore rules forbid users from writing `role` on their own profile. Instead:
 *   1. a user files a request  -> roleRequests/{uid}_{role}   (status 'pending')
 *   2. an admin approves it    -> users/{uid}.role updated (+ staff assignment) and the request marked 'approved'
 *   3. admins can also verify restaurants -> restaurants/{id}.verified = true
 * All admin-only writes are enforced by the rules (isAdmin()), not by this client code.
 */

export const ROLE_REQUESTS_COLLECTION = 'roleRequests';
export type RequestableRole = 'restaurant_staff' | 'courier';
export type RoleRequestStatus = 'pending' | 'approved' | 'rejected';

export interface RoleRequest {
  id: string;
  userId: string;
  requestedRole: RequestableRole;
  restaurantId?: string;
  note?: string;
  status: RoleRequestStatus;
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export function roleRequestId(uid: string, role: RequestableRole): string {
  return `${uid}_${role}`;
}

export async function submitRoleRequest(
  role: RequestableRole,
  opts: { restaurantId?: string; note?: string } = {}
): Promise<RoleRequest> {
  const user = auth.currentUser;
  if (!user) throw new Error('Please sign in to request a role.');
  if (role === 'restaurant_staff' && !opts.restaurantId) throw new Error('Choose the restaurant you work for.');
  const id = roleRequestId(user.uid, role);
  const request: Omit<RoleRequest, 'id'> = {
    userId: user.uid,
    requestedRole: role,
    status: 'pending',
    createdAt: new Date().toISOString(),
    ...(opts.restaurantId ? { restaurantId: opts.restaurantId } : {}),
    ...(opts.note ? { note: opts.note.slice(0, 500) } : {})
  };
  try {
    await setDoc(doc(db, ROLE_REQUESTS_COLLECTION, id), request);
  } catch (err) {
    handleFirestoreError(err, { operation: 'create', path: `${ROLE_REQUESTS_COLLECTION}/${id}` }, { silent: true });
    throw err;
  }
  return { id, ...request };
}

export function subscribeToMyRoleRequests(uid: string, callback: (requests: RoleRequest[]) => void) {
  const q = query(collection(db, ROLE_REQUESTS_COLLECTION), where('userId', '==', uid));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as RoleRequest)));
  }, (err) => handleFirestoreError(err, { operation: 'subscribe', path: ROLE_REQUESTS_COLLECTION }));
}

/** Admin: live list of role requests still awaiting a decision. */
export function subscribeToPendingRoleRequests(callback: (requests: RoleRequest[]) => void) {
  const q = query(collection(db, ROLE_REQUESTS_COLLECTION), where('status', '==', 'pending'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as RoleRequest)));
  }, (err) => handleFirestoreError(err, { operation: 'subscribe', path: ROLE_REQUESTS_COLLECTION }));
}

/**
 * Admin: approve a role request. Atomically (batch) grants the role, links restaurant staff to their restaurant and
 * marks the request approved. Rejected by the rules for non-admins.
 */
export async function approveRoleRequest(request: RoleRequest, adminUid: string): Promise<void> {
  const now = new Date().toISOString();
  try {
    const userRef = doc(db, 'users', request.userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) throw new Error('The requesting user no longer exists.');

    const batch = writeBatch(db);
    const userUpdate: Record<string, unknown> = { role: request.requestedRole };
    if (request.requestedRole === 'restaurant_staff' && request.restaurantId) {
      userUpdate['kitchenStaff.assignedRestaurantId'] = request.restaurantId;
      batch.update(doc(db, RESTAURANTS_COLLECTION, request.restaurantId), { staffIds: arrayUnion(request.userId) });
    }
    if (request.requestedRole === 'courier') {
      userUpdate['courier.courierId'] = request.userId;
    }
    batch.update(userRef, userUpdate);
    batch.update(doc(db, ROLE_REQUESTS_COLLECTION, request.id), { status: 'approved', reviewedBy: adminUid, reviewedAt: now });
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, { operation: 'update', path: `${ROLE_REQUESTS_COLLECTION}/${request.id}` }, { silent: true });
    throw err;
  }
}

export async function rejectRoleRequest(request: RoleRequest, adminUid: string): Promise<void> {
  try {
    await updateDoc(doc(db, ROLE_REQUESTS_COLLECTION, request.id), {
      status: 'rejected',
      reviewedBy: adminUid,
      reviewedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, { operation: 'update', path: `${ROLE_REQUESTS_COLLECTION}/${request.id}` }, { silent: true });
    throw err;
  }
}

/** Requester: remove a rejected request so they can re-apply. */
export async function withdrawRoleRequest(requestId: string): Promise<void> {
  await deleteDoc(doc(db, ROLE_REQUESTS_COLLECTION, requestId));
}

/** Admin: live list of restaurants waiting for verification. */
export function subscribeToPendingRestaurants(callback: (restaurants: { id: string; name?: string; city?: string; ownerId?: string }[]) => void) {
  const q = query(collection(db, RESTAURANTS_COLLECTION), where('verificationStatus', '==', 'pending'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) })));
  }, (err) => handleFirestoreError(err, { operation: 'subscribe', path: RESTAURANTS_COLLECTION }));
}

/** Admin: verify (or reject) a restaurant listing. */
export async function setRestaurantVerification(restaurantId: string, verified: boolean): Promise<void> {
  try {
    await updateDoc(doc(db, RESTAURANTS_COLLECTION, restaurantId), {
      verified,
      verificationStatus: verified ? 'verified' : 'rejected'
    });
  } catch (err) {
    handleFirestoreError(err, { operation: 'update', path: `${RESTAURANTS_COLLECTION}/${restaurantId}` }, { silent: true });
    throw err;
  }
}
