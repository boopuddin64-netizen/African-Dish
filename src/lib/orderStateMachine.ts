import type { OrderStatus } from '../types';

/**
 * Order state machine — single source of truth for the client.
 * MUST stay in sync with `isValidOrderTransition` in firestore.rules (src/tests/roleFlow.test.ts parses the rules file
 * and fails if the two diverge).
 */
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
  delivered: ['refunded'],
  payment_failed: ['payment_pending', 'cancelled'],
  rejected: ['refunded'],
  cancelled: ['refunded'],
  refunded: [],
  confirmed: ['preparing', 'out_for_delivery', 'delivered'],
  on_the_way: ['delivered']
};

export type OrderActor = 'customer' | 'restaurant' | 'courier' | 'admin';

/**
 * Target statuses each actor may set (mirrors the per-role branches of the `orders` update rule).
 * `paid`, `payment_failed` and `restaurant_pending` are set only by the trusted server (payment webhook / Admin SDK).
 */
export const ACTOR_TARGET_STATUSES: Record<OrderActor, OrderStatus[] | 'any'> = {
  customer: ['checkout', 'payment_pending', 'cancelled'],
  restaurant: ['accepted', 'preparing', 'ready', 'rejected', 'cancelled'],
  courier: ['out_for_delivery', 'delivered'],
  admin: 'any'
};

export function isValidOrderStatusTransition(currentStatus: OrderStatus, nextStatus: OrderStatus): boolean {
  if (currentStatus === nextStatus) return true;
  const allowed = VALID_ORDER_TRANSITIONS[currentStatus];
  // Unknown current status => refuse (fail closed, same as the rules)
  return allowed ? allowed.includes(nextStatus) : false;
}

/** Can `actor` move an order from `from` to `to`? (state machine AND actor permission; UI helper + test oracle.) */
export function canActorTransition(actor: OrderActor, from: OrderStatus, to: OrderStatus): boolean {
  if (!isValidOrderStatusTransition(from, to)) return false;
  const targets = ACTOR_TARGET_STATUSES[actor];
  return targets === 'any' || targets.includes(to) || from === to;
}
