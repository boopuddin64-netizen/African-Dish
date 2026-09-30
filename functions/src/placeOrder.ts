import { Firestore, DocumentSnapshot } from 'firebase-admin/firestore';
import { randomUUID } from 'crypto';
import { computeOrderPricing, Currency, MealDoc, RestaurantDoc, toMinorUnits, PricingError } from './pricing';

export interface PlaceOrderRequest {
  restaurantId: string;
  items: { mealId: string; quantity: number; customizationIds?: string[]; specialInstructions?: string }[];
  fulfillmentMethod: 'delivery' | 'pickup';
  currency: Currency;
  deliveryAddress: Record<string, unknown>;
  paymentMethod?: string;
  tapCount?: number;
}

/**
 * Authoritative order pricing + creation (Admin SDK). Used by the `placeOrder` callable and by the emulator role-flow test.
 * The client sends ONLY meal ids / quantities / customization ids. Prices, fees and totals are computed here from the
 * `meals` and `restaurants` documents, then the order is written as payment_pending / pending with `serverPriced: true`.
 * Firestore rules forbid clients from setting `serverPriced`, so only trusted code can create a payable order.
 */
export async function createPricedOrder(db: Firestore, uid: string, data: PlaceOrderRequest, fallbackName = '') {
  if (!data || typeof data.restaurantId !== 'string' || !Array.isArray(data.items)) {
    throw new PricingError('invalid-argument', 'restaurantId and items are required.');
  }
  if (data.fulfillmentMethod !== 'delivery' && data.fulfillmentMethod !== 'pickup') {
    throw new PricingError('invalid-argument', 'fulfillmentMethod must be delivery or pickup.');
  }
  const restRef = db.collection('restaurants').doc(data.restaurantId);
  const [restSnap, ...mealSnaps] = await db.getAll(restRef, ...data.items.map((i) => db.collection('meals').doc(String(i.mealId))));
  if (!restSnap.exists) throw new PricingError('not-found', 'Restaurant not found.');
  const meals: Record<string, MealDoc | undefined> = {};
  const mealDocs: Record<string, Record<string, unknown>> = {};
  mealSnaps.forEach((s: DocumentSnapshot) => {
    meals[s.id] = s.exists ? (s.data() as MealDoc) : undefined;
    if (s.exists) mealDocs[s.id] = { id: s.id, ...s.data() };
  });
  const restaurant = restSnap.data() as RestaurantDoc & Record<string, any>;

  const pricing = computeOrderPricing({
    lines: data.items,
    meals,
    restaurantId: data.restaurantId,
    restaurant,
    currency: data.currency,
    fulfillmentMethod: data.fulfillmentMethod,
  });

  const userSnap = await db.collection('users').doc(uid).get();
  const user = (userSnap.data() ?? {}) as Record<string, any>;
  const orderId = `ord_${randomUUID()}`;
  const now = new Date().toISOString();
  const order = {
    id: orderId,
    orderNumber: `ORD-${orderId.slice(4, 12).toUpperCase()}`,
    userId: uid,
    customerName: user.name ?? fallbackName,
    customerPhone: user.phone ?? '',
    items: data.items.map((item, idx) => ({
      id: `item_${idx}_${randomUUID().slice(0, 8)}`,
      meal: mealDocs[item.mealId],
      restaurant: { id: restSnap.id, ...restaurant },
      quantity: pricing.lines[idx].quantity,
      selectedCustomizations: pricing.lines[idx].customizations,
      itemPrice: pricing.lines[idx].itemPrice,
      ...(typeof item.specialInstructions === 'string' ? { specialInstructions: item.specialInstructions.slice(0, 300) } : {}),
    })),
    restaurantId: data.restaurantId,
    restaurantName: String(restaurant.name ?? ''),
    fulfillmentMethod: data.fulfillmentMethod,
    deliveryAddress: data.deliveryAddress ?? {},
    subtotal: pricing.subtotal,
    deliveryFee: pricing.deliveryFee,
    serviceFee: pricing.serviceFee,
    total: pricing.total,
    currency: data.currency,
    status: 'payment_pending',
    paymentStatus: 'pending',
    paymentMethod: typeof data.paymentMethod === 'string' ? data.paymentMethod.slice(0, 40) : 'card',
    paymentReference: `TX_${randomUUID()}`,
    serverPriced: true,
    createdAt: now,
    updatedAt: now,
    estimatedDeliveryTime: `${restaurant.estimatedDeliveryMin ?? 25}-${restaurant.estimatedDeliveryMax ?? 40} mins`,
    tapCount: typeof data.tapCount === 'number' ? data.tapCount : 0,
    courierMessages: [{ id: 'msg_init', sender: 'system', text: 'Order placed. Awaiting payment confirmation.', timestamp: now }],
  };
  await db.collection('orders').doc(orderId).set(order);
  return { orderId, order, paymentReference: order.paymentReference, amountMinor: toMinorUnits(pricing.total) };
}
