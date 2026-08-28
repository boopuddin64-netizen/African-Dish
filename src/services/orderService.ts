import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Order, OrderStatus } from '../types';
import { handleFirestoreError } from '../lib/errorHandling';

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
  const serviceFee = order.serviceFee || Math.round(recalculatedSubtotal * 0.05);
  const total = recalculatedSubtotal + deliveryFee + serviceFee;

  return {
    subtotal: recalculatedSubtotal,
    deliveryFee,
    serviceFee,
    total
  };
}

/**
 * Creates a new order in Firestore with initial state 'payment_pending'.
 */
export async function createOrderInFirestore(order: Order): Promise<string> {
  if (!auth.currentUser || auth.currentUser.uid !== order.userId) {
    console.log('User is in guest mode or unauthenticated. Order created in local session state.');
    return order.id;
  }

  try {
    const totals = calculateAuthoritativeOrderTotal(order);
    const ref = doc(db, ORDERS_COLLECTION, order.id);
    await setDoc(ref, {
      ...order,
      subtotal: totals.subtotal,
      serviceFee: totals.serviceFee,
      total: totals.total,
      status: order.status || 'payment_pending',
      paymentStatus: order.paymentStatus || 'pending',
      createdAt: order.createdAt || new Date().toISOString()
    });
    return order.id;
  } catch (err) {
    handleFirestoreError(err, { operation: 'create', path: `${ORDERS_COLLECTION}/${order.id}` });
    throw err;
  }
}

export const VALID_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  cart: ['checkout', 'payment_pending', 'cancelled'],
  checkout: ['payment_pending', 'cancelled'],
  payment_pending: ['paid', 'payment_failed', 'cancelled'],
  paid: ['restaurant_pending', 'accepted', 'rejected', 'cancelled'],
  restaurant_pending: ['accepted', 'rejected', 'cancelled'],
  accepted: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['out_for_delivery', 'delivered', 'cancelled'],
  out_for_delivery: ['delivered', 'cancelled'],
  delivered: [],
  payment_failed: ['payment_pending', 'cancelled'],
  rejected: ['refunded'],
  cancelled: ['refunded'],
  refunded: [],
  confirmed: ['preparing', 'out_for_delivery', 'delivered'],
  on_the_way: ['delivered']
};

export function isValidOrderStatusTransition(currentStatus: OrderStatus, nextStatus: OrderStatus): boolean {
  if (currentStatus === nextStatus) return true;
  const allowed = VALID_ORDER_TRANSITIONS[currentStatus];
  return allowed ? allowed.includes(nextStatus) : true;
}

/**
 * Updates order state in Firestore with authoritative state transition rules.
 */
export async function updateOrderStatusInFirestore(
  orderId: string, 
  newStatus: OrderStatus, 
  extraUpdates?: Partial<Order>
): Promise<void> {
  if (!auth.currentUser) {
    console.log('User is unauthenticated. Order status updated in local state.');
    return;
  }

  try {
    const ref = doc(db, ORDERS_COLLECTION, orderId);
    
    // Check transition validity if document exists
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const currentOrder = snap.data() as Order;
      if (!isValidOrderStatusTransition(currentOrder.status, newStatus)) {
        console.warn(`Invalid order state transition attempted: ${currentOrder.status} -> ${newStatus}`);
      }
    }

    const paymentStatusUpdate = 
      newStatus === 'paid' ? 'paid' :
      newStatus === 'payment_failed' ? 'failed' :
      newStatus === 'refunded' ? 'refunded' : undefined;

    await setDoc(ref, {
      status: newStatus,
      ...(paymentStatusUpdate ? { paymentStatus: paymentStatusUpdate } : {}),
      updatedAt: new Date().toISOString(),
      ...extraUpdates
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, { operation: 'update', path: `${ORDERS_COLLECTION}/${orderId}` });
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


