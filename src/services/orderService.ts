import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  updateDoc, 
  arrayUnion,
  onSnapshot, 
  query, 
  where
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Order, OrderStatus, CourierMessage } from '../types';
import { handleFirestoreError } from '../lib/errorHandling';
import { generateId } from '../lib/ids';
import { VALID_ORDER_TRANSITIONS, isValidOrderStatusTransition } from '../lib/orderStateMachine';

export const ORDERS_COLLECTION = 'orders';

/**
 * Validates and recalculates subtotal and total for order integrity.
 */
export function calculateAuthoritativeOrderTotal(order: Order): {
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
} {
  const recalculatedSubtotal = order.items.reduce((acc, item) => {
    const customSum = (item.selectedCustomizations || []).reduce((cAcc, c) => cAcc + (c.priceDelta || 0), 0);
    return acc + ((item.itemPrice || (item.meal.priceNGN + customSum)) * item.quantity);
  }, 0);

  const deliveryFee = order.deliveryFee || 0;
  const serviceFee = order.serviceFee || Math.round(recalculatedSubtotal * 5) / 100;
  const total = recalculatedSubtotal + deliveryFee + serviceFee;

  return {
    subtotal: recalculatedSubtotal,
    deliveryFee,
    serviceFee,
    total
  };
}

/** Thrown for problems we detect ourselves (guest mode, invalid transition, missing order); message is user-facing. */
export class OrderServiceError extends Error {
  constructor(public code: 'guest' | 'invalid_transition' | 'not_found' | 'forbidden_client_transition' | 'invalid_state', message: string) {
    super(message);
    this.name = 'OrderServiceError';
  }
}

export const GUEST_ORDER_MESSAGE =
  'Please sign in to place an order. Guest sessions are demo-only and orders are not saved.';

/**
 * Writes a client-side DRAFT order (status payment_pending / paymentStatus pending) with a collision-resistant id.
 * Drafts are NOT payable: only orders created by the `placeOrder` Cloud Function carry `serverPriced: true`, and the
 * payment webhook refuses everything else. Prefer `placeOrderOnServer` (paymentService) for real checkouts.
 *
 * Guests (no Firebase Auth user) are rejected explicitly instead of silently "succeeding".
 */
export async function createOrderInFirestore(order: Order): Promise<string> {
  if (!auth.currentUser || auth.currentUser.uid !== order.userId) {
    throw new OrderServiceError('guest', GUEST_ORDER_MESSAGE);
  }

  try {
    const totals = calculateAuthoritativeOrderTotal(order);
    const id = order.id || generateId('ord');
    const ref = doc(db, ORDERS_COLLECTION, id);
    await setDoc(ref, {
      ...order,
      id,
      subtotal: totals.subtotal,
      serviceFee: totals.serviceFee,
      total: totals.total,
      status: order.status || 'payment_pending',
      paymentStatus: order.paymentStatus || 'pending',
      createdAt: order.createdAt || new Date().toISOString()
    });
    return id;
  } catch (err) {
    handleFirestoreError(err, { operation: 'create', path: `${ORDERS_COLLECTION}/${order.id}` }, { silent: true });
    throw err;
  }
}

export { VALID_ORDER_TRANSITIONS, isValidOrderStatusTransition };

/**
 * Updates an order's status with client-side state-machine validation.
 * - Never writes on an invalid transition (throws OrderServiceError).
 * - Never creates a missing document (uses updateDoc, not setDoc/merge).
 * - Propagates every error to the caller so the UI can display it.
 * - Never sets paid / restaurant_pending: those are set only by the trusted payment webhook.
 */
export async function updateOrderStatusInFirestore(
  orderId: string,
  newStatus: OrderStatus,
  extraUpdates?: Partial<Order>
): Promise<void> {
  if (!auth.currentUser) {
    throw new OrderServiceError('guest', 'Please sign in to update orders.');
  }
  if (newStatus === 'paid' || newStatus === 'restaurant_pending') {
    throw new OrderServiceError(
      'forbidden_client_transition',
      'Payment confirmation is handled securely by the server; the app cannot mark an order as paid.'
    );
  }

  const ref = doc(db, ORDERS_COLLECTION, orderId);
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      throw new OrderServiceError('not_found', 'This order no longer exists.');
    }
    const currentStatus = (snap.data() as Order).status;
    if (!isValidOrderStatusTransition(currentStatus, newStatus)) {
      throw new OrderServiceError('invalid_transition', `Can't change an order from "${currentStatus}" to "${newStatus}".`);
    }

    const paymentStatusUpdate =
      newStatus === 'payment_failed' ? 'failed' :
      newStatus === 'refunded' ? 'refunded' : undefined;

    await updateDoc(ref, {
      status: newStatus,
      ...(paymentStatusUpdate ? { paymentStatus: paymentStatusUpdate } : {}),
      updatedAt: new Date().toISOString(),
      ...extraUpdates
    });
  } catch (err) {
    if (!(err instanceof OrderServiceError)) {
      handleFirestoreError(err, { operation: 'update', path: `${ORDERS_COLLECTION}/${orderId}` }, { silent: true });
    }
    throw err;
  }
}

/** Customer rating: writes ONLY ratingSubmitted + updatedAt (status is untouched; rules allow nothing else). */
export async function submitOrderRatingInFirestore(orderId: string, rating: NonNullable<Order['ratingSubmitted']>): Promise<void> {
  if (!auth.currentUser) throw new OrderServiceError('guest', 'Please sign in to rate an order.');
  try {
    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
      ratingSubmitted: rating,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, { operation: 'update', path: `${ORDERS_COLLECTION}/${orderId}` }, { silent: true });
    throw err;
  }
}

/** Appends one chat message (atomic arrayUnion; no read-modify-write race). */
export async function appendCourierMessageInFirestore(orderId: string, message: CourierMessage): Promise<void> {
  if (!auth.currentUser) throw new OrderServiceError('guest', 'Please sign in to send messages.');
  try {
    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
      courierMessages: arrayUnion(message),
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, { operation: 'update', path: `${ORDERS_COLLECTION}/${orderId}` }, { silent: true });
    throw err;
  }
}

/** Restaurant staff: assign a courier (rules verify the uid really has the courier role). */
export async function assignCourierInFirestore(orderId: string, courierId: string): Promise<void> {
  if (!auth.currentUser) throw new OrderServiceError('guest', 'Please sign in to assign couriers.');
  if (!courierId.trim()) throw new OrderServiceError('invalid_state', 'Enter a courier ID first.');
  try {
    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
      courierId: courierId.trim(),
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, { operation: 'update', path: `${ORDERS_COLLECTION}/${orderId}` }, { silent: true });
    throw err;
  }
}

/**
 * Real-time listener for user orders or restaurant/courier portal orders.
 */
export function subscribeToOrders(
  userId: string, 
  role: 'customer' | 'restaurant_staff' | 'courier' | 'admin', 
  restaurantId?: string,
  callback?: (orders: Order[]) => void
) {
  // If user is not authenticated in Firebase Auth, return no-op subscription
  if (!auth.currentUser) {
    if (callback) callback([]);
    return () => {};
  }

  // Customer query MUST filter by auth.currentUser.uid to satisfy security rules
  if (role === 'customer' && auth.currentUser.uid !== userId) {
    if (callback) callback([]);
    return () => {};
  }

  const col = collection(db, ORDERS_COLLECTION);
  let q;

  if (role === 'customer') {
    q = query(col, where('userId', '==', auth.currentUser.uid));
  } else if (role === 'restaurant_staff' && restaurantId) {
    q = query(col, where('restaurantId', '==', restaurantId));
  } else if (role === 'courier') {
    q = query(col, where('courierId', '==', auth.currentUser.uid));
  } else if (role === 'admin') {
    q = query(col);
  } else {
    q = query(col, where('userId', '==', auth.currentUser.uid));
  }

  return onSnapshot(q, (snapshot) => {
    const list: Order[] = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as Order);
    });
    // Sort client-side by createdAt descending
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (callback) callback(list);
  }, (err) => {
    handleFirestoreError(err, { operation: 'subscribe', path: ORDERS_COLLECTION });
  });
}


