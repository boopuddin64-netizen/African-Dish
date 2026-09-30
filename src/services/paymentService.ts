import { httpsCallable } from 'firebase/functions';
import { functions, USE_EMULATORS } from '../lib/firebase';
import { Order, CartItem, Currency, SavedLocation } from '../types';

/**
 * Payment / pricing client. IMPORTANT: the client NEVER marks an order as paid.
 * Firestore rules forbid it. Payment confirmation happens on the server:
 *   Paystack -> `paystackWebhook` Cloud Function (signature-verified) -> Admin SDK moves the order
 *   payment_pending -> paid -> restaurant_pending. The UI simply observes the order via its Firestore subscription.
 */

/**
 * DEV / SIMULATION MODE. When true, `startPayment` calls the `simulatePayment` callable instead of Paystack.
 * It is only honoured in Vite dev builds AND when explicitly enabled; additionally the function itself refuses to run
 * outside the Functions emulator (or ALLOW_PAYMENT_SIMULATION=true on the server). Never true in production builds.
 */
export const PAYMENT_SIMULATION_ENABLED =
  import.meta.env?.DEV === true && (import.meta.env?.VITE_ENABLE_PAYMENT_SIMULATION === 'true' || USE_EMULATORS);

export interface ServerOrderRequest {
  restaurantId: string;
  items: { mealId: string; quantity: number; customizationIds: string[]; specialInstructions?: string }[];
  fulfillmentMethod: 'delivery' | 'pickup';
  currency: Currency;
  deliveryAddress: SavedLocation;
  paymentMethod?: string;
  tapCount?: number;
}

export interface ServerOrderResponse {
  orderId: string;
  order: Order;
  paymentReference: string;
  amountMinor: number;
}

export function cartToServerItems(items: CartItem[]): ServerOrderRequest['items'] {
  return items.map((i) => ({
    mealId: i.meal.id,
    quantity: i.quantity,
    customizationIds: i.selectedCustomizations.map((c) => c.id),
    ...(i.specialInstructions ? { specialInstructions: i.specialInstructions } : {}),
  }));
}

/** Server-side pricing + order creation (`placeOrder` Cloud Function). Totals returned are authoritative. */
export async function placeOrderOnServer(req: ServerOrderRequest): Promise<ServerOrderResponse> {
  const fn = httpsCallable<ServerOrderRequest, ServerOrderResponse>(functions, 'placeOrder');
  const res = await fn(req);
  return res.data;
}

export type PaymentStartResult =
  | { mode: 'redirect'; authorizationUrl: string; paymentReference: string }
  | { mode: 'simulated'; paymentReference?: string };

/**
 * Starts payment for a server-priced order. In production returns a Paystack checkout URL to redirect to;
 * in clearly-gated dev mode asks the emulator-only `simulatePayment` function to confirm the payment server-side.
 */
export async function startPayment(orderId: string): Promise<PaymentStartResult> {
  if (PAYMENT_SIMULATION_ENABLED) {
    const sim = httpsCallable<{ orderId: string }, { ok: boolean }>(functions, 'simulatePayment');
    await sim({ orderId });
    return { mode: 'simulated' };
  }
  const init = httpsCallable<{ orderId: string }, { authorizationUrl?: string; paymentReference: string }>(functions, 'initializePayment');
  const res = await init({ orderId });
  if (!res.data.authorizationUrl) throw new Error('Payment provider did not return a checkout URL.');
  return { mode: 'redirect', authorizationUrl: res.data.authorizationUrl, paymentReference: res.data.paymentReference };
}
