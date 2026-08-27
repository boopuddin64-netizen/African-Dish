import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order, OrderStatus } from '../types';

export const ORDERS_COLLECTION = 'orders';

/**
 * Creates a new order in Firestore with initial state 'payment_pending'.
 */
export async function createOrderInFirestore(order: Order): Promise<string> {
  const ref = doc(db, ORDERS_COLLECTION, order.id);
  await setDoc(ref, {
    ...order,
    status: order.status || 'payment_pending',
    paymentStatus: order.paymentStatus || 'pending',
    createdAt: order.createdAt || new Date().toISOString()
  });
  return order.id;
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
  const ref = doc(db, ORDERS_COLLECTION, orderId);
  
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
  const col = collection(db, ORDERS_COLLECTION);
  let q = query(col);

  if (role === 'customer') {
    q = query(col, where('userId', '==', userId));
  } else if (role === 'restaurant_staff' && restaurantId) {
    q = query(col, where('restaurantId', '==', restaurantId));
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
    console.error('Error in orders snapshot:', err);
  });
}
