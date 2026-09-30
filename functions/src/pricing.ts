/**
 * Pure, dependency-free pricing logic. Shared by the `placeOrder` callable and the payment webhook so that
 * both compute the *same* authoritative totals from Firestore `meals` / `restaurants` documents.
 * (Kept free of firebase imports so it can also be unit-tested from the root test-suite.)
 */

export type Currency = 'NGN' | 'GBP';

export interface MealDoc {
  restaurantId: string;
  name?: string;
  priceNGN: number;
  priceGBP: number;
  isAvailable?: boolean;
  customizationOptions?: { id: string; name?: string; priceDelta: number }[];
}

export interface RestaurantDoc {
  isOpen?: boolean;
  acceptingOrders?: boolean;
  verified?: boolean;
  verificationStatus?: string;
  deliveryFeeNGN?: number;
  deliveryFeeGBP?: number;
  minimumOrderNGN?: number;
  minimumOrderGBP?: number;
  fulfillmentOptions?: string[];
}

export interface PricingLineInput {
  mealId: string;
  quantity: number;
  customizationIds?: string[];
}

export interface PricedLine {
  mealId: string;
  quantity: number;
  itemPrice: number; // unit price incl. customizations
  lineTotal: number;
  customizations: { id: string; name?: string; priceDelta: number }[];
}

export interface PricingResult {
  lines: PricedLine[];
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
}

export const SERVICE_FEE_RATE = 0.05;
export const MAX_LINES = 50;
export const MAX_QUANTITY = 50;

export class PricingError extends Error {
  constructor(public code: 'invalid-argument' | 'failed-precondition' | 'not-found', message: string) {
    super(message);
  }
}

/** Round to 2 decimals (GBP pennies); NGN totals are whole numbers in practice. */
const round2 = (n: number) => Math.round(n * 100) / 100;

export function computeOrderPricing(args: {
  lines: PricingLineInput[];
  meals: Record<string, MealDoc | undefined>;
  restaurantId: string;
  restaurant: RestaurantDoc;
  currency: Currency;
  fulfillmentMethod: 'delivery' | 'pickup';
}): PricingResult {
  const { lines, meals, restaurantId, restaurant, currency, fulfillmentMethod } = args;

  if (!Array.isArray(lines) || lines.length === 0 || lines.length > MAX_LINES) {
    throw new PricingError('invalid-argument', `Order must contain between 1 and ${MAX_LINES} items.`);
  }
  if (currency !== 'NGN' && currency !== 'GBP') {
    throw new PricingError('invalid-argument', 'Unsupported currency.');
  }
  if (restaurant.verified === false || restaurant.verificationStatus === 'pending' || restaurant.verificationStatus === 'rejected') {
    throw new PricingError('failed-precondition', 'This restaurant has not been verified yet.');
  }
  if (restaurant.isOpen === false || restaurant.acceptingOrders === false) {
    throw new PricingError('failed-precondition', 'This restaurant is not accepting orders right now.');
  }
  if (fulfillmentMethod === 'pickup' && restaurant.fulfillmentOptions && !restaurant.fulfillmentOptions.includes('pickup')) {
    throw new PricingError('failed-precondition', 'This restaurant does not offer pickup.');
  }

  const priced: PricedLine[] = lines.map((line) => {
    if (!line || typeof line.mealId !== 'string' || !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > MAX_QUANTITY) {
      throw new PricingError('invalid-argument', 'Invalid order line.');
    }
    const meal = meals[line.mealId];
    if (!meal) throw new PricingError('not-found', `Meal ${line.mealId} does not exist.`);
    if (meal.restaurantId !== restaurantId) {
      throw new PricingError('invalid-argument', `Meal ${line.mealId} does not belong to this restaurant.`);
    }
    if (meal.isAvailable === false) {
      throw new PricingError('failed-precondition', `${meal.name ?? line.mealId} is currently unavailable.`);
    }
    const unitBase = currency === 'NGN' ? meal.priceNGN : meal.priceGBP;
    if (typeof unitBase !== 'number' || !(unitBase >= 0)) {
      throw new PricingError('failed-precondition', `Meal ${line.mealId} has no valid price.`);
    }
    const chosen = (line.customizationIds ?? []).map((cid) => {
      const opt = (meal.customizationOptions ?? []).find((o) => o.id === cid);
      if (!opt) throw new PricingError('invalid-argument', `Unknown customization ${cid} for meal ${line.mealId}.`);
      return { id: opt.id, name: opt.name, priceDelta: opt.priceDelta };
    });
    const itemPrice = round2(unitBase + chosen.reduce((s, c) => s + c.priceDelta, 0));
    return { mealId: line.mealId, quantity: line.quantity, itemPrice, lineTotal: round2(itemPrice * line.quantity), customizations: chosen };
  });

  const subtotal = round2(priced.reduce((s, l) => s + l.lineTotal, 0));
  const minimum = (currency === 'NGN' ? restaurant.minimumOrderNGN : restaurant.minimumOrderGBP) ?? 0;
  if (subtotal < minimum) {
    throw new PricingError('failed-precondition', `Minimum order for this restaurant is ${minimum} ${currency}.`);
  }
  const deliveryFee = fulfillmentMethod === 'delivery'
    ? ((currency === 'NGN' ? restaurant.deliveryFeeNGN : restaurant.deliveryFeeGBP) ?? 0)
    : 0;
  const serviceFee = round2(subtotal * SERVICE_FEE_RATE);
  const total = round2(subtotal + deliveryFee + serviceFee);
  return { lines: priced, subtotal, deliveryFee, serviceFee, total };
}

/** Amount in minor units (kobo / pence) as expected by Paystack. */
export function toMinorUnits(amount: number): number {
  return Math.round(amount * 100);
}
